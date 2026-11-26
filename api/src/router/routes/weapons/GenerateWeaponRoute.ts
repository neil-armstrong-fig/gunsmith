import {WEAPON_PIPELINE_VERSION} from "@gunsmith/ai/pipeline/weapon-graph/history/WeaponPipelineVersion";
import {historyRequestOf} from "@src/router/routes/shared/generation-history/HistoryRequestOf";
import {recordGenerationAttempt} from "@src/router/routes/shared/generation-history/RecordGenerationAttempt";
import type {GenerationHistoryRequest} from "@src/router/routes/shared/generation-history/types/GenerationHistoryRequest";
import {weaponAttemptOutcome} from "@src/router/routes/weapons/history/WeaponAttemptOutcome";
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
 * period ends). The credit is then settled at what the request was (a weapon costs one credit, a rejected prompt half, and so does a request
 * that reached the model and gave no valid weapon: the model was used) or refunded in full (turned away before any model call, or the pipeline
 * threw), and the spend at the model calls it made (`durable-objects/spend-ledger/estimate/`), or in full if the
 * pipeline threw or ran out of time (`shared/time-limit/`: 504 `generation-timed-out`), since its calls may have been billed. **A created weapon
 * is kept under an `id` the answer carries** (`shared/keep-result/`), so the library saves it by that id alone; if it cannot be kept the credit is
 * refunded and the answer is 502.
 */
export async function generateWeaponRoute(request: Request): Promise<Response> {
  const historyRequest = historyRequestOf(request, {kind: "weapon", pipelineVersion: WEAPON_PIPELINE_VERSION});
  const reservation = await reserveCredit(request, {
    pipelineAvailable: isWeaponPipelineAvailable(),
    kind: "weapon",
    reservedMicrodollars: WEAPON_SPEND.reservedMicrodollars,
    trackBlockedAttempt: historyRequest !== undefined,
  });
  if ("response" in reservation) {
    if (historyRequest && reservation.blockedAttempt) {
      await recordGenerationAttempt(historyRequest, reservation.blockedAttempt);
    }

    return reservation.response;
  }

  return await runAndSettle(reservation, historyRequest);
}

async function runAndSettle(
  reservation: CreditReservation,
  historyRequest: GenerationHistoryRequest | undefined,
): Promise<Response> {
  const {credits, spend, key, prompt} = reservation;
  let outcome: WeaponOutcome;
  try {
    outcome = await withTimeLimit(signal => runWeaponPipeline(prompt, signal), PIPELINE_TIME_LIMIT_MILLISECONDS);
  } catch (error) {
    await spend.settle(key, WEAPON_SPEND.reservedMicrodollars);
    await credits.refund(key);

    const response = failureAnswer(error);
    if (historyRequest) {
      await recordGenerationAttempt(historyRequest, {
        accountId: reservation.accountId,
        key,
        reason: response.status === 504 ? "generation-timed-out" : "generation-failed",
      });
    }

    return response;
  }

  const response = await settleOutcome(reservation, outcome);
  const diagnostics = outcome.history;
  if (historyRequest && diagnostics) {
    await recordGenerationAttempt(historyRequest, {
      reservation,
      diagnostics,
      classification: weaponAttemptOutcome(outcome, diagnostics, response),
    });
  }

  return response;
}

async function settleOutcome(reservation: CreditReservation, outcome: WeaponOutcome): Promise<Response> {
  const {credits, spend, key} = reservation;
  await spend.settle(key, settledWeaponSpend(outcome));
  if (outcome.status === "created") {
    const id = await keepCreatedResult(reservation, "weapon", {
      weapon: outcome.weapon,
      appearance: outcome.appearance?.appearance,
    });
    if (id instanceof Response) {
      return id;
    }
    await credits.settle(key, "weapon");

    return Response.json({...answerOf(outcome), id});
  }
  if (isTurnedAwayBeforeTheModel(outcome)) {
    await credits.refund(key);

    return Response.json(answerOf(outcome));
  }
  if (outcome.status === "rejected") {
    await credits.settle(key, "rejected");
  }
  if (outcome.status === "invalid") {
    await credits.settle(key, "unusable");
  }

  return Response.json(answerOf(outcome));
}

/** The one request that cost nothing: turned away before any model was called (the length pre-check). `WeaponOutcome` has no `refunded` flag, so the calls say so. */
function isTurnedAwayBeforeTheModel(outcome: WeaponOutcome): boolean {
  return outcome.status === "rejected" && outcome.modelCalls === 0;
}

function answerOf(outcome: WeaponOutcome): WeaponAnswer {
  return {
    status: outcome.status,
    weapon: outcome.weapon,
    appearance: outcome.appearance?.appearance,
    reason: outcome.reason,
  };
}
