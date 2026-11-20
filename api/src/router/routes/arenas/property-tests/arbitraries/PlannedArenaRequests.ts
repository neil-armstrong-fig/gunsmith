import fc from "fast-check";
import type {PlannedArenaOutcome} from "@src/router/routes/arenas/property-tests/types/PlannedArenaOutcome";
import type {PlannedArenaRequest} from "@src/router/routes/arenas/property-tests/types/PlannedArenaRequest";

/** 15 to 40 requests from two accounts (so one runs out of credits), each ending as the arena pipeline can end: an arena, a rejection after the moderation call, a turn-away before any model call, a built-in arena, or a throw. */
export function plannedArenaRequests(): fc.Arbitrary<PlannedArenaRequest[]> {
  return fc.array(plannedArenaRequest(), {minLength: 15, maxLength: 40});
}

function plannedArenaRequest(): fc.Arbitrary<PlannedArenaRequest> {
  return fc.record({accountId: fc.constantFrom("acct-a", "acct-b"), outcome: plannedArenaOutcome()});
}

/**
 * Created arenas are common, so an account is likely to spend all its credits and be refused. The model calls vary with how the
 * pipeline got there: an arena is made in two calls or, after the one repair, three; a built-in arena follows a refused repair
 * (three calls; two is allowed too, so the property does not depend on the graph's exact path); a rejection is the moderation call alone.
 */
function plannedArenaOutcome(): fc.Arbitrary<PlannedArenaOutcome> {
  return fc.oneof(
    {
      weight: 6,
      arbitrary: fc.constantFrom(2, 3).map<PlannedArenaOutcome>(modelCalls => {
        return {status: "created", arena: {}, refunded: false, nodes: [], modelCalls};
      }),
    },
    {
      weight: 1,
      arbitrary: fc.constant<PlannedArenaOutcome>({
        status: "rejected",
        reason: "no",
        refunded: false,
        nodes: [],
        modelCalls: 1,
      }),
    },
    {
      weight: 1,
      arbitrary: fc.constantFrom(2, 3).map<PlannedArenaOutcome>(modelCalls => {
        return {status: "builtIn", arena: {}, reason: "none", refunded: false, nodes: [], modelCalls};
      }),
    },
    {
      weight: 1,
      arbitrary: fc.constant<PlannedArenaOutcome>({
        status: "rejected",
        reason: "too long",
        refunded: true,
        nodes: [],
        modelCalls: 0,
      }),
    },
    {weight: 1, arbitrary: fc.constant<PlannedArenaOutcome>("throws")},
  );
}
