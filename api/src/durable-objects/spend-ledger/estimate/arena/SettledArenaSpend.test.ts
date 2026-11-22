import type {ArenaOutcome} from "@gunsmith/ai/pipeline/arena/types/ArenaOutcome";
import {ARENA_SPEND} from "@src/durable-objects/spend-ledger/estimate/arena/ArenaSpend";
import {pricedUsage} from "@src/durable-objects/spend-ledger/estimate/tokens/PricedUsage";
import {settledArenaSpend} from "@src/durable-objects/spend-ledger/estimate/arena/SettledArenaSpend";

it("prices the first call as moderation, the second as the arena's generation and the third as its repair", () => {
  expect(settledArenaSpend(outcomeWithCalls(1))).toBe(ARENA_SPEND.moderationMicrodollars);
  expect(settledArenaSpend(outcomeWithCalls(2))).toBe(
    ARENA_SPEND.moderationMicrodollars + ARENA_SPEND.generationMicrodollars,
  );
  expect(settledArenaSpend(outcomeWithCalls(3))).toBe(
    ARENA_SPEND.moderationMicrodollars + ARENA_SPEND.generationMicrodollars + ARENA_SPEND.repairMicrodollars,
  );
});

it("charges nothing for a request that never reached a model", () => {
  expect(settledArenaSpend(outcomeWithCalls(0))).toBe(0);
});

it("settles at the tokens the models reported, priced, whatever the number of calls", () => {
  const reported = {inputTokens: 1_500, outputTokens: 400};

  expect(settledArenaSpend({...outcomeWithCalls(3), usage: reported})).toBe(pricedUsage(reported));
  expect(settledArenaSpend({...outcomeWithCalls(1), usage: reported})).toBe(350);
});

it("falls back to the price of each call's place when the models reported no tokens", () => {
  const nothingReported = {inputTokens: 0, outputTokens: 0};

  expect(settledArenaSpend({...outcomeWithCalls(2), usage: nothingReported})).toBe(
    ARENA_SPEND.moderationMicrodollars + ARENA_SPEND.generationMicrodollars,
  );
});

it("reserves at least what the most model calls a request can make would settle at", () => {
  expect(ARENA_SPEND.reservedMicrodollars).toBeGreaterThanOrEqual(
    settledArenaSpend(outcomeWithCalls(ARENA_SPEND.mostCalls)),
  );
});

it("prices a rejection far below a drawn arena, since moderation is the cheap call", () => {
  expect(settledArenaSpend(outcomeWithCalls(1)) * 4).toBeLessThan(settledArenaSpend(outcomeWithCalls(2)));
});

it("prices each call at about what the Haiku figures in the cost doc say, never at nothing", () => {
  expect(ARENA_SPEND.moderationMicrodollars).toBeGreaterThanOrEqual(150);
  expect(ARENA_SPEND.moderationMicrodollars).toBeLessThanOrEqual(300);
  expect(ARENA_SPEND.generationMicrodollars).toBeGreaterThanOrEqual(980);
  expect(ARENA_SPEND.generationMicrodollars).toBeLessThanOrEqual(2_000);
  expect(ARENA_SPEND.repairMicrodollars).toBeGreaterThanOrEqual(ARENA_SPEND.generationMicrodollars);
});

function outcomeWithCalls(modelCalls: number): ArenaOutcome {
  return {status: "created", arena: {}, refunded: false, nodes: [], modelCalls};
}
