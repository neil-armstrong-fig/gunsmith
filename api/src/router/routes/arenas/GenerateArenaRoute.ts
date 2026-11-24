import {ARENA_PIPELINE_VERSION} from "@gunsmith/ai/pipeline/arena/history/ArenaPipelineVersion";
import {arenaAttemptOutcome} from "@src/router/routes/arenas/history/ArenaAttemptOutcome";
import {historyRequestOf} from "@src/router/routes/shared/generation-history/HistoryRequestOf";
import {recordGenerationAttempt} from "@src/router/routes/shared/generation-history/RecordGenerationAttempt";
import type {GenerationHistoryRequest} from "@src/router/routes/shared/generation-history/types/GenerationHistoryRequest";
import type {ArenaOutcome} from "@gunsmith/ai/pipeline/arena/types/ArenaOutcome";
import {ARENA_SPEND} from "@src/durable-objects/spend-ledger/estimate/arena/ArenaSpend";
import {settledArenaSpend} from "@src/durable-objects/spend-ledger/estimate/arena/SettledArenaSpend";
import {isArenaPipelineAvailable} from "@src/router/routes/arenas/pipeline/IsArenaPipelineAvailable";
import {runArenaPipeline} from "@src/router/routes/arenas/pipeline/RunArenaPipeline";
import {keepCreatedResult} from "@src/router/routes/shared/keep-result/KeepCreatedResult";
import {reserveCredit} from "@src/router/routes/shared/ReserveCredit";
import type {CreditReservation} from "@src/router/routes/shared/types/CreditReservation";
import {failureAnswer} from "@src/router/routes/shared/time-limit/FailureAnswer";
import {PIPELINE_TIME_LIMIT_MILLISECONDS} from "@src/router/routes/shared/time-limit/PipelineTimeLimit";
import {withTimeLimit} from "@src/router/routes/shared/time-limit/WithTimeLimit";
import type {ArenaAnswer} from "@src/router/routes/arenas/types/ArenaAnswer";

/**
 * `POST /api/arenas` with `{prompt}` from a signed-in player (the session cookie names the account that pays): turns the words into an arena through the
 * pipeline it is handed, with the same credit and spend rules around the call as `GenerateWeaponRoute`: the credit, then the global
 * spend at its worst case (`ARENA_SPEND`), are reserved before the pipeline runs. The credit is settled at what the request was (an
 * arena costs one credit, a rejected prompt half, and so does a built-in arena, given when no playable one could be made: the model
 * was used) or refunded in full: when the pipeline threw (502), or when the request was turned away before any model call
 * (`outcome.refunded`, which `ai` sets exactly then). The spend is settled at the model calls the outcome made, `builtIn` included
 * (the model was billed), or at the whole reservation if the pipeline threw or timed out (504).
 * **A created arena is kept under an `id` the answer carries** (`shared/keep-result/`), so the library saves it by that id alone; if it
 * cannot be kept the credit is refunded and the answer is 502.
 */
export async function generateArenaRoute(request: Request): Promise<Response> {
  const historyRequest = historyRequestOf(request, {kind: "arena", pipelineVersion: ARENA_PIPELINE_VERSION});
  const reservation = await reserveCredit(request, {
    pipelineAvailable: isArenaPipelineAvailable(),
    kind: "arena",
    reservedMicrodollars: ARENA_SPEND.reservedMicrodollars,
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
  let outcome: ArenaOutcome;
  try {
    outcome = await withTimeLimit(signal => runArenaPipeline(prompt, signal), PIPELINE_TIME_LIMIT_MILLISECONDS);
  } catch (error) {
    await spend.settle(key, ARENA_SPEND.reservedMicrodollars);
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
      classification: arenaAttemptOutcome(outcome.status, diagnostics, response),
    });
  }

  return response;
}

async function settleOutcome(reservation: CreditReservation, outcome: ArenaOutcome): Promise<Response> {
  const {credits, spend, key} = reservation;
  await spend.settle(key, settledArenaSpend(outcome));
  if (outcome.status === "created") {
    const id = await keepCreatedResult(reservation, "arena", {arena: outcome.arena});
    if (id instanceof Response) {
      return id;
    }
    await credits.settle(key, "arena");

    return Response.json({...answerOf(outcome), id});
  }
  if (outcome.refunded) {
    await credits.refund(key);

    return Response.json(answerOf(outcome));
  }
  if (outcome.status === "rejected") {
    await credits.settle(key, "rejected");
  }
  if (outcome.status === "builtIn") {
    await credits.settle(key, "unusable");
  }

  return Response.json(answerOf(outcome));
}

function answerOf(outcome: ArenaOutcome): ArenaAnswer {
  return {status: outcome.status, arena: outcome.arena, reason: outcome.reason};
}
