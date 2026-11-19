import type {ApiEnvironment} from "@src/env/types/ApiEnvironment";
import {parseAccountId} from "@src/router/routes/shared/account-id/ParseAccountId";
import {parsePromptRequest} from "@src/router/routes/shared/prompt-request/ParsePromptRequest";
import type {CreditReservation} from "@src/router/routes/shared/types/CreditReservation";
import type {ReserveCreditAsk} from "@src/router/routes/shared/types/ReserveCreditAsk";

/**
 * The guards both generation routes share, in order, each taking nothing until it has passed: the method (405), a pipeline to run
 * (503 `ai-unavailable`), an account (401), a prompt (400), the global AI switch (503 `ai-off`), then the account's credit, **reserved
 * before the pipeline runs, so two requests for the last credit cannot both run** (402 `no-credits`). Answers the refusal as a
 * `Response`, or the reservation to run the pipeline under. The route then settles it at what the request was, or refunds it.
 */
export async function reserveCredit<Smith>(
  request: Request,
  env: ApiEnvironment,
  {smith, kind}: ReserveCreditAsk<Smith>,
): Promise<CreditReservation<Smith> | Response> {
  if (request.method !== "POST") {
    return Response.json({error: "method-not-allowed"}, {status: 405, headers: {Allow: "POST"}});
  }
  if (!smith) {
    return Response.json({error: "ai-unavailable"}, {status: 503});
  }

  const accountId = parseAccountId(request.headers.get("X-Account-Id") ?? undefined);
  if (!accountId) {
    return Response.json({error: "account-required"}, {status: 401});
  }

  const prompt = parsePromptRequest(await request.text());
  if (prompt === undefined) {
    return Response.json({error: "bad-request"}, {status: 400});
  }

  const aiStatus = await env.SPEND.getByName("spend").status();
  if (!aiStatus.on) {
    return Response.json({error: "ai-off", returnsAt: aiStatus.returnsAt}, {status: 503});
  }

  const credits = env.CREDITS.getByName(accountId);
  const key = crypto.randomUUID();
  const reserved = await credits.reserve(key, kind);
  if (reserved === "insufficient") {
    return Response.json({error: "no-credits"}, {status: 402});
  }

  return {credits, key, prompt, smith};
}
