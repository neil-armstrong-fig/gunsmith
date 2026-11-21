import {tokenSpend} from "@src/durable-objects/spend-ledger/estimate/token-price/TokenSpend";

it("prices input tokens at Haiku 5.5's $0.10 a million and output tokens at $0.50 a million", () => {
  expect(tokenSpend({inputTokens: 1_000_000, outputTokens: 0})).toBe(100_000);
  expect(tokenSpend({inputTokens: 0, outputTokens: 1_000_000})).toBe(500_000);
});

it("adds the input and the output, as one request's calls were summed", () => {
  expect(tokenSpend({inputTokens: 1_000, outputTokens: 600})).toBe(400);
});

it("rounds a fraction of a microdollar up, so settling never undercounts", () => {
  expect(tokenSpend({inputTokens: 1, outputTokens: 0})).toBe(1);
  expect(tokenSpend({inputTokens: 11, outputTokens: 0})).toBe(2);
});

it("answers nothing when the models reported no tokens, so the caller falls back to its estimate", () => {
  expect(tokenSpend({inputTokens: 0, outputTokens: 0})).toBeUndefined();
  expect(tokenSpend(undefined)).toBeUndefined();
});
