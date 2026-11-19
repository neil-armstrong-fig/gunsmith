import type {WeaponOutcome} from "@gunsmith/ai/pipeline/types/WeaponOutcome";
import type {ApiEnvironment} from "@src/env/types/ApiEnvironment";
import {parseAccountId} from "@src/generation/account-id/ParseAccountId";
import type {WeaponAnswer} from "@src/generation/types/WeaponAnswer";
import type {WeaponSettlement} from "@src/generation/types/WeaponSettlement";
import type {WeaponSmith} from "@src/generation/types/WeaponSmith";
import {parseWeaponRequest} from "@src/generation/weapon-request/ParseWeaponRequest";

/**
 * `POST /api/weapons` with `{prompt}` and an `X-Account-Id` (a stand-in for the session): turns the words into a weapon through the
 * pipeline it is handed, with the credit rules around the call (`docs/cost-and-budget.md`). In order, taking nothing until each guard
 * has passed: the method, a pipeline to run, an account, a prompt, the global AI switch (`SPEND.status()`), then the account's credit
 * (**reserved before the pipeline runs, so two requests for the last credit cannot both run**). The reservation is then settled at what
 * the request was (a weapon costs one credit, a rejected prompt half) or refunded in full (no valid weapon, or the pipeline threw).
 * Not done yet, by design: reserving the global spend (`SPEND.reserve`), which waits for budget's cost estimate, and a time limit on the
 * pipeline.
 */
export async function generateWeaponRoute(
  request: Request,
  env: ApiEnvironment,
  weaponSmith: WeaponSmith | undefined,
): Promise<Response> {
  if (request.method !== "POST") {
    return Response.json({error: "method-not-allowed"}, {status: 405, headers: {Allow: "POST"}});
  }
  if (!weaponSmith) {
    return Response.json({error: "ai-unavailable"}, {status: 503});
  }

  const accountId = parseAccountId(request.headers.get("X-Account-Id") ?? undefined);
  if (!accountId) {
    return Response.json({error: "account-required"}, {status: 401});
  }

  const prompt = parseWeaponRequest(await request.text());
  if (prompt === undefined) {
    return Response.json({error: "bad-request"}, {status: 400});
  }

  const aiStatus = await env.SPEND.getByName("spend").status();
  if (!aiStatus.on) {
    return Response.json({error: "ai-off", returnsAt: aiStatus.returnsAt}, {status: 503});
  }

  const credits = env.CREDITS.getByName(accountId);
  const key = crypto.randomUUID();
  const reserved = await credits.reserve(key, "weapon");
  if (reserved === "insufficient") {
    return Response.json({error: "no-credits"}, {status: 402});
  }

  return await runAndSettle({credits, key, prompt, weaponSmith});
}

async function runAndSettle({credits, key, prompt, weaponSmith}: WeaponSettlement): Promise<Response> {
  let outcome: WeaponOutcome;
  try {
    outcome = await weaponSmith(prompt);
  } catch {
    await credits.refund(key);

    return Response.json({error: "generation-failed"}, {status: 502});
  }

  if (outcome.status === "created") {
    await credits.settle(key, "weapon");
  }
  if (outcome.status === "rejected") {
    await credits.settle(key, "rejected");
  }
  if (outcome.status === "invalid") {
    await credits.refund(key);
  }

  return Response.json(answerOf(outcome));
}

function answerOf(outcome: WeaponOutcome): WeaponAnswer {
  return {status: outcome.status, weapon: outcome.weapon, appearance: outcome.appearance, reason: outcome.reason};
}
