import fc from "fast-check";
import type {WeaponOutcome} from "@gunsmith/ai/pipeline/weapon/types/WeaponOutcome";
import {reportedUsages} from "@src/router/routes/shared/property-tests/reported-usage/ReportedUsages";
import type {PlannedOutcome} from "@src/router/routes/weapons/property-tests/types/PlannedOutcome";
import type {PlannedRequest} from "@src/router/routes/weapons/property-tests/types/PlannedRequest";

/** 15 to 40 requests from two accounts (so one runs out of credits), each ending as the pipeline can end: a weapon, a rejection, no valid weapon, or a throw. */
export function plannedRequests(): fc.Arbitrary<PlannedRequest[]> {
  return fc.array(plannedRequest(), {minLength: 15, maxLength: 40});
}

function plannedRequest(): fc.Arbitrary<PlannedRequest> {
  return fc.record({accountId: fc.constantFrom("acct-a", "acct-b"), outcome: plannedOutcome()});
}

/** Weapons are common, so an account is likely to spend all its credits and be refused. An outcome may or may not report its models' tokens. */
function plannedOutcome(): fc.Arbitrary<PlannedOutcome> {
  return fc.oneof(
    {weight: 6, arbitrary: reporting({status: "created", weapon: {}, nodes: [], modelCalls: 3})},
    {weight: 1, arbitrary: reporting({status: "rejected", reason: "no", nodes: [], modelCalls: 1})},
    {weight: 1, arbitrary: reporting({status: "invalid", reason: "none", nodes: [], modelCalls: 3})},
    {
      weight: 1,
      arbitrary: fc.constant<PlannedOutcome>({status: "rejected", reason: "too long", nodes: [], modelCalls: 0}),
    },
    {weight: 1, arbitrary: fc.constant<PlannedOutcome>("throws")},
  );
}

function reporting(outcome: WeaponOutcome): fc.Arbitrary<PlannedOutcome> {
  return reportedUsages().map<PlannedOutcome>(usage => {
    if (!usage) {
      return outcome;
    }

    return {...outcome, usage};
  });
}
