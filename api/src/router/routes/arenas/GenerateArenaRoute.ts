import type {ArenaOutcome} from "@gunsmith/ai/pipeline/arena/types/ArenaOutcome";
import {ARENA_SPEND} from "@src/durable-objects/spend-ledger/estimate/arena/ArenaSpend";
import {settledArenaSpend} from "@src/durable-objects/spend-ledger/estimate/arena/SettledArenaSpend";
import type {ApiEnvironment} from "@src/env/types/ApiEnvironment";
import {reserveCredit} from "@src/router/routes/shared/ReserveCredit";
import type {CreditReservation} from "@src/router/routes/shared/types/CreditReservation";
import type {ArenaAnswer} from "@src/router/routes/arenas/types/ArenaAnswer";
import type {ArenaSmith} from "@src/router/routes/arenas/types/ArenaSmith";

/**
 * `POST /api/arenas` with `{prompt}` and an `X-Account-Id` (a stand-in for the session): turns the words into an arena through the
 * pipeline it is handed, with the same credit and spend rules around the call as `GenerateWeaponRoute`: the credit, then the global
 * spend at its worst case (`ARENA_SPEND`), are reserved before the pipeline runs. The credit is settled at what the request was (an
 * arena costs one credit, a rejected prompt half) or refunded in full: when the pipeline threw (502), or when it could not make a
 * playable arena and gave a built-in one (`builtIn`: the player still gets an arena, and the credit goes back). The spend is settled
 * at the model calls the outcome made, `builtIn` included (the model was billed), or at the whole reservation if the pipeline threw.
 */
export async function generateArenaRoute(
  request: Request,
  env: ApiEnvironment,
  arenaSmith: ArenaSmith | undefined,
): Promise<Response> {
  const reservation = await reserveCredit(request, env, {
    smith: arenaSmith,
    kind: "arena",
    reservedMicrodollars: ARENA_SPEND.reservedMicrodollars,
  });
  if (reservation instanceof Response) {
    return reservation;
  }

  return await runAndSettle(reservation);
}

async function runAndSettle({credits, spend, key, prompt, smith}: CreditReservation<ArenaSmith>): Promise<Response> {
  let outcome: ArenaOutcome;
  try {
    outcome = await smith(prompt);
  } catch {
    await spend.settle(key, ARENA_SPEND.reservedMicrodollars);
    await credits.refund(key);

    return Response.json({error: "generation-failed"}, {status: 502});
  }

  await spend.settle(key, settledArenaSpend(outcome));
  if (outcome.status === "created") {
    await credits.settle(key, "arena");
  }
  if (outcome.status === "rejected") {
    await credits.settle(key, "rejected");
  }
  if (outcome.status === "builtIn") {
    await credits.refund(key);
  }

  return Response.json(answerOf(outcome));
}

function answerOf(outcome: ArenaOutcome): ArenaAnswer {
  return {status: outcome.status, arena: outcome.arena, reason: outcome.reason};
}
