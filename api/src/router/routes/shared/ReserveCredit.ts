import {workerEnvironment} from "@src/env/WorkerEnvironment";
import {parsePromptRequest} from "@src/router/routes/shared/prompt-request/ParsePromptRequest";
import type {BlockedCreditAttempt} from "@src/router/routes/shared/types/BlockedCreditAttempt";
import type {CreditRefusal} from "@src/router/routes/shared/types/CreditRefusal";
import type {CreditReservation} from "@src/router/routes/shared/types/CreditReservation";
import {accountOfRequest} from "@src/router/routes/shared/session/AccountOfRequest";
import type {ReserveCreditAsk} from "@src/router/routes/shared/types/ReserveCreditAsk";

/**
 * The guards both generation routes share, in order, each taking nothing until it has passed: the method (405), a pipeline to run
 * (503 `ai-unavailable`), a signed-in player (401: the session cookie, never a header a caller could write), a prompt (400), the global AI switch (503 `ai-off`), then the account's credit, **reserved
 * before the pipeline runs, so two requests for the last credit cannot both run** (402 `no-credits`), then, when the route gave an
 * estimate, the global spend at that worst case (**so a burst cannot cross a cap**; a `paused` spend refunds the credit and answers
 * 503 `ai-off` with `returnsAt`). A refusal carries the HTTP response and, when requested and eligible, metadata for private history.
 */
export async function reserveCredit(
  request: Request,
  {pipelineAvailable, kind, reservedMicrodollars, trackBlockedAttempt = false}: ReserveCreditAsk,
): Promise<CreditReservation | CreditRefusal> {
  if (request.method !== "POST") {
    return {response: Response.json({error: "method-not-allowed"}, {status: 405, headers: {Allow: "POST"}})};
  }
  if (!pipelineAvailable) {
    return await unavailableRefusal(request, trackBlockedAttempt);
  }

  const account = await accountOfRequest(request);
  if (!account) {
    return {response: Response.json({error: "account-required"}, {status: 401})};
  }

  const prompt = parsePromptRequest(await request.text());
  if (prompt === undefined) {
    return {response: Response.json({error: "bad-request"}, {status: 400})};
  }

  const spend = workerEnvironment.SPEND.getByName("spend");
  const aiStatus = await spend.status();
  if (!aiStatus.on) {
    const response = Response.json({error: "ai-off", returnsAt: aiStatus.returnsAt}, {status: 503});
    if (!trackBlockedAttempt) return {response};

    return {response, blockedAttempt: {accountId: account.id, key: crypto.randomUUID(), reason: "ai-off"}};
  }

  const credits = workerEnvironment.CREDITS.getByName(account.id);
  const key = crypto.randomUUID();
  const reserved = await credits.reserve(key, kind);
  if (reserved === "insufficient") {
    return blockedRefusal(Response.json({error: "no-credits"}, {status: 402}), trackBlockedAttempt, {
      accountId: account.id,
      key,
      reason: "no-credits",
    });
  }

  if (reservedMicrodollars !== undefined) {
    const spendReserved = await spend.reserve(key, reservedMicrodollars);
    if (spendReserved === "paused") {
      await credits.refund(key);
      const pausedStatus = await spend.status();

      return blockedRefusal(
        Response.json({error: "ai-off", returnsAt: pausedStatus.returnsAt}, {status: 503}),
        trackBlockedAttempt,
        {accountId: account.id, key, reason: "spend-cap"},
      );
    }
  }

  return {credits, spend, accountId: account.id, key, prompt};
}

async function unavailableRefusal(request: Request, trackBlockedAttempt: boolean): Promise<CreditRefusal> {
  const response = Response.json({error: "ai-unavailable"}, {status: 503});
  if (!trackBlockedAttempt) return {response};

  try {
    const account = await accountOfRequest(request);
    if (!account || parsePromptRequest(await request.text()) === undefined) return {response};

    return {response, blockedAttempt: {accountId: account.id, key: crypto.randomUUID(), reason: "ai-unavailable"}};
  } catch {
    return {response};
  }
}

function blockedRefusal(
  response: Response,
  trackBlockedAttempt: boolean,
  attempt: BlockedCreditAttempt,
): CreditRefusal {
  if (trackBlockedAttempt) return {response, blockedAttempt: attempt};

  return {response};
}
