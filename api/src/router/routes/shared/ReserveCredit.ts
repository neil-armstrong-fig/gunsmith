import {workerEnvironment} from "@src/env/WorkerEnvironment";
import {parsePromptRequest} from "@src/router/routes/shared/prompt-request/ParsePromptRequest";
import type {CreditReservation} from "@src/router/routes/shared/types/CreditReservation";
import {accountOfRequest} from "@src/router/routes/shared/session/AccountOfRequest";
import type {ReserveCreditAsk} from "@src/router/routes/shared/types/ReserveCreditAsk";

/**
 * The guards both generation routes share, in order, each taking nothing until it has passed: the method (405), a pipeline to run
 * (503 `ai-unavailable`), a signed-in player (401: the session cookie, never a header a caller could write), a prompt (400), the global AI switch (503 `ai-off`), then the account's credit, **reserved
 * before the pipeline runs, so two requests for the last credit cannot both run** (402 `no-credits`), then, when the route gave an
 * estimate, the global spend at that worst case (**so a burst cannot cross a cap**; a `paused` spend refunds the credit and answers
 * 503 `ai-off` with `returnsAt`). Answers the refusal as a `Response`, or the reservation to run the pipeline under. The route then
 * settles it at what the request was, or refunds it.
 */
export async function reserveCredit(
  request: Request,
  {pipelineAvailable, kind, reservedMicrodollars}: ReserveCreditAsk,
): Promise<CreditReservation | Response> {
  if (request.method !== "POST") {
    return Response.json({error: "method-not-allowed"}, {status: 405, headers: {Allow: "POST"}});
  }
  if (!pipelineAvailable) {
    return Response.json({error: "ai-unavailable"}, {status: 503});
  }

  const account = await accountOfRequest(request);
  if (!account) {
    return Response.json({error: "account-required"}, {status: 401});
  }

  const prompt = parsePromptRequest(await request.text());
  if (prompt === undefined) {
    return Response.json({error: "bad-request"}, {status: 400});
  }

  const spend = workerEnvironment.SPEND.getByName("spend");
  const aiStatus = await spend.status();
  if (!aiStatus.on) {
    return Response.json({error: "ai-off", returnsAt: aiStatus.returnsAt}, {status: 503});
  }

  const credits = workerEnvironment.CREDITS.getByName(account.id);
  const key = crypto.randomUUID();
  const reserved = await credits.reserve(key, kind);
  if (reserved === "insufficient") {
    return Response.json({error: "no-credits"}, {status: 402});
  }

  if (reservedMicrodollars !== undefined) {
    const spendReserved = await spend.reserve(key, reservedMicrodollars);
    if (spendReserved === "paused") {
      await credits.refund(key);
      const pausedStatus = await spend.status();

      return Response.json({error: "ai-off", returnsAt: pausedStatus.returnsAt}, {status: 503});
    }
  }

  return {credits, spend, key, prompt};
}
