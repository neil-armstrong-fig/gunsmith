import type {WeaponOutcome} from "@gunsmith/ai/pipeline/types/WeaponOutcome";
import type {ApiEnvironment} from "@src/env/types/ApiEnvironment";
import {reserveCredit} from "@src/router/routes/shared/ReserveCredit";
import type {CreditReservation} from "@src/router/routes/shared/types/CreditReservation";
import type {WeaponAnswer} from "@src/router/routes/weapons/types/WeaponAnswer";
import type {WeaponSmith} from "@src/router/routes/weapons/types/WeaponSmith";

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
  const reservation = await reserveCredit(request, env, {smith: weaponSmith, kind: "weapon"});
  if (reservation instanceof Response) {
    return reservation;
  }

  return await runAndSettle(reservation);
}

async function runAndSettle({credits, key, prompt, smith}: CreditReservation<WeaponSmith>): Promise<Response> {
  let outcome: WeaponOutcome;
  try {
    outcome = await smith(prompt);
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
