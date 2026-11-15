import {summariseResults} from "@evals/eval-criteria-mapping/reporting/SummariseResults";
import type {CriterionResult} from "@evals/eval-criteria-mapping/reporting/types/CriterionResult";

const passing: CriterionResult = {
  given: "a player asks for a weapon",
  when: "they ask for a plain rifle",
  then: "a weapon is created",
  suite: "regression",
  passed: true,
};

const failing: CriterionResult = {
  given: "a player asks for a weapon",
  when: "they ask for a riot shield",
  then: "a weapon is created",
  suite: "inProgress",
  passed: false,
  comment: "outcomeMatches: failed in 3 of 3 trials: expected created, got invalid",
};

const run = {spec: "AskingForAWeapon", tier: "local", trials: 3, ranAt: "2026-11-12T16:00:00.000Z"} as const;

it("counts the criteria and how many passed", () => {
  const summary = summariseResults({...run, results: [passing, failing, passing]});

  expect(summary).toMatchObject({criteria: 3, criteriaPassed: 2});
});

it("tallies each suite on its own", () => {
  const summary = summariseResults({...run, results: [passing, failing, passing]});

  expect(summary.regression).toEqual({criteria: 2, passed: 2});
  expect(summary.inProgress).toEqual({criteria: 1, passed: 0});
});

it("keeps every criterion, with the sentence that says why a failed one failed", () => {
  const summary = summariseResults({...run, results: [passing, failing]});

  expect(summary.results[1]?.comment).toBe("outcomeMatches: failed in 3 of 3 trials: expected created, got invalid");
});

it("says which spec, tier and number of trials it summarises, and when", () => {
  const summary = summariseResults({...run, results: []});

  expect(summary).toMatchObject({
    spec: "AskingForAWeapon",
    tier: "local",
    trials: 3,
    ranAt: "2026-11-12T16:00:00.000Z",
  });
});
