import type {WeaponOutcome} from "@gunsmith/ai/pipeline/types/WeaponOutcome";
import {settledWeaponSpend} from "@src/durable-objects/spend-ledger/estimate/weapon/SettledWeaponSpend";
import {WEAPON_SPEND} from "@src/durable-objects/spend-ledger/estimate/weapon/WeaponSpend";
import {isWeaponPipelineAvailable} from "@src/router/routes/weapons/pipeline/IsWeaponPipelineAvailable";
import {runWeaponPipeline} from "@src/router/routes/weapons/pipeline/RunWeaponPipeline";
import {keepCreatedResult} from "@src/router/routes/shared/keep-result/KeepCreatedResult";
import {reserveCredit} from "@src/router/routes/shared/ReserveCredit";
import type {CreditReservation} from "@src/router/routes/shared/types/CreditReservation";
import {failureAnswer} from "@src/router/routes/shared/time-limit/FailureAnswer";
import {PIPELINE_TIME_LIMIT_MILLISECONDS} from "@src/router/routes/shared/time-limit/PipelineTimeLimit";
import {withTimeLimit} from "@src/router/routes/shared/time-limit/WithTimeLimit";
import type {WeaponAnswer} from "@src/router/routes/weapons/types/WeaponAnswer";

/**
 * `POST /api/weapons` with `{prompt}` from a signed-in player (the session cookie names the account that pays): turns the words into a weapon through the
 * pipeline it is handed, with the credit rules around the call (`docs/cost-and-budget.md`). In order, taking nothing until each guard
 * has passed: the method, a pipeline to run, an account, a prompt, the global AI switch (`SPEND.status()`), then the account's credit
 * (**reserved before the pipeline runs, so two requests for the last credit cannot both run**) and the global spend (**reserved at the
 * worst case before the pipeline runs, so a burst cannot cross a cap**; refused, the credit is given back and AI is off until the cap's
 * period ends). The credit is then settled at what the request was (a weapon costs one credit, a rejected prompt half) or refunded in
 * full (no valid weapon, or the pipeline threw), and the spend at the model calls it made (`durable-objects/spend-ledger/estimate/`), or in full if the
 * pipeline threw or ran out of time (`shared/time-limit/`: 504 `generation-timed-out`), since its calls may have been billed. **A created weapon
 * is kept under an `id` the answer carries** (`shared/keep-result/`), so the library saves it by that id alone; if it cannot be kept the credit is
 * refunded and the answer is 502.
 */
export async function generateWeaponRoute(request: Request): Promise<Response> {
  const reservation = await reserveCredit(request, {
    pipelineAvailable: isWeaponPipelineAvailable(),
    kind: "weapon",
    reservedMicrodollars: WEAPON_SPEND.reservedMicrodollars,
  });
  if (reservation instanceof Response) {
    return reservation;
  }

  return await runAndSettle(reservation);
}

async function runAndSettle(reservation: CreditReservation): Promise<Response> {
  const {credits, spend, key, prompt} = reservation;
  let outcome: WeaponOutcome;
  try {
    outcome = await withTimeLimit(runWeaponPipeline(prompt), PIPELINE_TIME_LIMIT_MILLISECONDS);
  } catch (error) {
    await spend.settle(key, WEAPON_SPEND.reservedMicrodollars);
    await credits.refund(key);

    return failureAnswer(error);
  }

  await spend.settle(key, settledWeaponSpend(outcome));
  if (outcome.status === "created") {
    const id = await keepCreatedResult(reservation, "weapon", {weapon: outcome.weapon, appearance: outcome.appearance});
    if (id instanceof Response) {
      return id;
    }
    await credits.settle(key, "weapon");

    return Response.json({...answerOf(outcome), id});
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
