import type {CriterionResult} from "@evals/eval-criteria-mapping/environment/reporting/types/CriterionResult";
import {foldTrials} from "@evals/eval-criteria-mapping/mapping/run/fold-trials/FoldTrials";

it("leaves one row per criterion as it is", () => {
  const rows = [row({then: "a weapon is created", passed: false, comment: "expected created, got rejected"})];

  expect(foldTrials(rows)).toEqual(rows);
});

it("folds a criterion's trials into one row that holds only if it held in every trial (pass^k)", () => {
  const folded = foldTrials([
    row({then: "a weapon is created", passed: true}),
    row({then: "a weapon is created", passed: true}),
    row({then: "a weapon is created", passed: true}),
  ]);

  expect(folded).toEqual([row({then: "a weapon is created", passed: true})]);
});

it("says in how many trials a criterion failed, and why in the first", () => {
  const folded = foldTrials([
    row({then: "a weapon is created", passed: true}),
    row({then: "a weapon is created", passed: false, comment: "expected created, got rejected"}),
    row({then: "a weapon is created", passed: false, comment: "expected created, got invalid"}),
  ]);

  expect(folded).toEqual([
    row({
      then: "a weapon is created",
      passed: false,
      comment: "failed in 2 of 3 trials: expected created, got rejected",
    }),
  ]);
});

it("keeps criteria of different requests apart, in the order they first appeared", () => {
  const folded = foldTrials([
    row({when: "they ask for a rifle", then: "a weapon is created"}),
    row({when: "they ask for a haiku", then: "a weapon is created"}),
    row({when: "they ask for a rifle", then: "a weapon is created"}),
  ]);

  expect(folded.map(({when}) => when)).toEqual(["they ask for a rifle", "they ask for a haiku"]);
});

function row(overrides: Partial<CriterionResult>): CriterionResult {
  return {
    given: "a player asks",
    when: "they ask for a rifle",
    then: "x",
    suite: "regression",
    passed: true,
    ...overrides,
  };
}
