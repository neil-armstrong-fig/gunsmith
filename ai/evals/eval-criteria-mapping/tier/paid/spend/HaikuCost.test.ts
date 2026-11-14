import {haikuCost} from "@evals/eval-criteria-mapping/tier/paid/spend/HaikuCost";

it("charges ten cents for a million input tokens", () => {
  expect(haikuCost({inputTokens: 1_000_000, outputTokens: 0})).toBeCloseTo(0.1, 10);
});

it("charges fifty cents for a million output tokens", () => {
  expect(haikuCost({inputTokens: 0, outputTokens: 1_000_000})).toBeCloseTo(0.5, 10);
});

it("adds the two, so a drawing of 3,500 tokens in and 2,000 out costs about a tenth of a cent", () => {
  expect(haikuCost({inputTokens: 3500, outputTokens: 2000})).toBeCloseTo(0.00135, 10);
});
