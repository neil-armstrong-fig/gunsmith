import fc from "fast-check";
import type {PlannedOutcome} from "@src/generation/property-tests/types/PlannedOutcome";
import type {PlannedRequest} from "@src/generation/property-tests/types/PlannedRequest";

/** 15 to 40 requests from two accounts (so one runs out of credits), each ending as the pipeline can end: a weapon, a rejection, no valid weapon, or a throw. */
export function plannedRequests(): fc.Arbitrary<PlannedRequest[]> {
  return fc.array(plannedRequest(), {minLength: 15, maxLength: 40});
}

function plannedRequest(): fc.Arbitrary<PlannedRequest> {
  return fc.record({accountId: fc.constantFrom("acct-a", "acct-b"), outcome: plannedOutcome()});
}

/** Weapons are common, so an account is likely to spend all its credits and be refused. */
function plannedOutcome(): fc.Arbitrary<PlannedOutcome> {
  return fc.oneof(
    {weight: 6, arbitrary: fc.constant<PlannedOutcome>({status: "created", weapon: {}, nodes: [], modelCalls: 3})},
    {weight: 1, arbitrary: fc.constant<PlannedOutcome>({status: "rejected", reason: "no", nodes: [], modelCalls: 1})},
    {weight: 1, arbitrary: fc.constant<PlannedOutcome>({status: "invalid", reason: "none", nodes: [], modelCalls: 5})},
    {weight: 1, arbitrary: fc.constant<PlannedOutcome>("throws")},
  );
}
