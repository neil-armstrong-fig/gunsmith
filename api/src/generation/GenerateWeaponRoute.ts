import type {WeaponOutcome} from "@gunsmith/ai/pipeline/types/WeaponOutcome";
import {settledWeaponSpend} from "@src/ai/spend/estimate/SettledWeaponSpend";
import {WEAPON_SPEND} from "@src/ai/spend/estimate/WeaponSpend";
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
 * (**reserved before the pipeline runs, so two requests for the last credit cannot both run**) and the global spend (**reserved at the
 * worst case before the pipeline runs, so a burst cannot cross a cap**; refused, the credit is given back and AI is off until the cap's
 * period ends). The credit is then settled at what the request was (a weapon costs one credit, a rejected prompt half) or refunded in
 * full (no valid weapon, or the pipeline threw), and the spend at the model calls it made (`ai/spend/estimate/`), or in full if the
 * pipeline threw, since its calls may have been billed. Not done yet, by design: a time limit on the pipeline.
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

  const spend = env.SPEND.getByName("spend");
  const aiStatus = await spend.status();
  if (!aiStatus.on) {
    return Response.json({error: "ai-off", returnsAt: aiStatus.returnsAt}, {status: 503});
  }

  const credits = env.CREDITS.getByName(accountId);
  const key = crypto.randomUUID();
  const reserved = await credits.reserve(key, "weapon");
  if (reserved === "insufficient") {
    return Response.json({error: "no-credits"}, {status: 402});
  }

  const spendReserved = await spend.reserve(key, WEAPON_SPEND.reservedMicrodollars);
  if (spendReserved === "paused") {
    await credits.refund(key);
    const pausedStatus = await spend.status();

    return Response.json({error: "ai-off", returnsAt: pausedStatus.returnsAt}, {status: 503});
  }

  return await runAndSettle({credits, spend, key, prompt, weaponSmith});
}

async function runAndSettle({credits, spend, key, prompt, weaponSmith}: WeaponSettlement): Promise<Response> {
  let outcome: WeaponOutcome;
  try {
    outcome = await weaponSmith(prompt);
  } catch {
    await spend.settle(key, WEAPON_SPEND.reservedMicrodollars);
    await credits.refund(key);

    return Response.json({error: "generation-failed"}, {status: 502});
  }

  await spend.settle(key, settledWeaponSpend(outcome));
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
