import {pricedUsage} from "@src/durable-objects/spend-ledger/estimate/tokens/PricedUsage";

it("prices input at $0.10 and output at $0.50 a million tokens, in microdollars", () => {
  expect(pricedUsage({inputTokens: 1_000_000, outputTokens: 1_000_000})).toBe(600_000);
  expect(pricedUsage({inputTokens: 2_000, outputTokens: 0})).toBe(200);
  expect(pricedUsage({inputTokens: 0, outputTokens: 300})).toBe(150);
});

it("rounds a fraction of a microdollar up, so the meter never undercounts", () => {
  expect(pricedUsage({inputTokens: 1, outputTokens: 0})).toBe(1);
  expect(pricedUsage({inputTokens: 11, outputTokens: 1})).toBe(2);
});

it("prices what a created weapon measured on Haiku: about a thousand microdollars", () => {
  expect(pricedUsage({inputTokens: 3_100, outputTokens: 1_300})).toBe(960);
});

it("says nothing was reported for no usage, or usage that is all zero", () => {
  expect(pricedUsage(undefined)).toBeUndefined();
  expect(pricedUsage({inputTokens: 0, outputTokens: 0})).toBeUndefined();
});

it("does not trust a count that is negative or not a finite number", () => {
  expect(pricedUsage({inputTokens: -5, outputTokens: 100})).toBeUndefined();
  expect(pricedUsage({inputTokens: 100, outputTokens: Number.NaN})).toBeUndefined();
  expect(pricedUsage({inputTokens: Number.POSITIVE_INFINITY, outputTokens: 0})).toBeUndefined();
});
