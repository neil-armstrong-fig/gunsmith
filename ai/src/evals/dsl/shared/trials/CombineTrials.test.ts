import {combineTrials} from "@evals/dsl/shared/trials/CombineTrials";

it("keeps a score that passed in every trial", () => {
  const trials = [[{key: "schemaValid", score: 1 as const}], [{key: "schemaValid", score: 1 as const}]];

  expect(combineTrials(trials)).toEqual([{key: "schemaValid", score: 1}]);
});

it("fails a score that failed in any one trial (pass^k), and says which trials", () => {
  const trials = [
    [{key: "withinCaps", score: 1 as const}],
    [{key: "withinCaps", score: 0 as const, comment: "2000 damage per second is over 150"}],
    [{key: "withinCaps", score: 1 as const}],
  ];

  expect(combineTrials(trials)).toEqual([
    {key: "withinCaps", score: 0, comment: "failed in 1 of 3 trials: 2000 damage per second is over 150"},
  ]);
});

it("combines each evaluator separately", () => {
  const trials = [
    [
      {key: "a", score: 1 as const},
      {key: "b", score: 0 as const, comment: "bad"},
    ],
    [
      {key: "a", score: 1 as const},
      {key: "b", score: 1 as const},
    ],
  ];

  expect(combineTrials(trials).map(score => score.score)).toEqual([1, 0]);
});

it("returns nothing for no trials", () => {
  expect(combineTrials([])).toEqual([]);
});
