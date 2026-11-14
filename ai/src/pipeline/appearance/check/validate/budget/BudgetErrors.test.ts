import {budgetErrors} from "@gunsmith/ai/pipeline/appearance/check/validate/budget/BudgetErrors";

const WITHIN = {bodyParts: 3, projectileParts: 0, points: 10, bytes: 2000};

it("finds nothing wrong with a measure inside every limit", () => {
  expect(budgetErrors(WITHIN)).toEqual([]);
});

it("accepts exactly the most points in all, and refuses one more", () => {
  expect(budgetErrors({...WITHIN, points: 384})).toEqual([]);
  expect(budgetErrors({...WITHIN, points: 385})).toEqual(["appearance: 385 points in all, over the limit of 384"]);
});

it("accepts exactly the most bytes, and refuses one more", () => {
  expect(budgetErrors({...WITHIN, bytes: 12288})).toEqual([]);
  expect(budgetErrors({...WITHIN, bytes: 12289})).toEqual(["appearance: 12289 bytes, over the limit of 12288"]);
});

it("names both when both are over", () => {
  expect(budgetErrors({...WITHIN, points: 400, bytes: 20000})).toHaveLength(2);
});
