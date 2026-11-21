import type {WeaponOutcome} from "@gunsmith/ai/pipeline/types/WeaponOutcome";
import {WEAPON_SPEND} from "@src/durable-objects/spend-ledger/estimate/weapon/WeaponSpend";
import {settledWeaponSpend} from "@src/durable-objects/spend-ledger/estimate/weapon/SettledWeaponSpend";

it("settles a request at the model calls it made, each at the estimated price of a call", () => {
  expect(settledWeaponSpend(outcomeWithCalls(3))).toBe(3 * WEAPON_SPEND.perCallMicrodollars);
  expect(settledWeaponSpend(outcomeWithCalls(1))).toBe(WEAPON_SPEND.perCallMicrodollars);
});

it("settles at the tokens the models reported when the outcome carries them, not at its calls", () => {
  expect(settledWeaponSpend({...outcomeWithCalls(3), usage: {inputTokens: 1_000, outputTokens: 600}})).toBe(400);
  expect(settledWeaponSpend({...outcomeWithCalls(1), usage: {inputTokens: 1_000_000, outputTokens: 0}})).toBe(100_000);
});

it("falls back to the calls when the models reported no tokens", () => {
  expect(settledWeaponSpend({...outcomeWithCalls(2), usage: {inputTokens: 0, outputTokens: 0}})).toBe(
    2 * WEAPON_SPEND.perCallMicrodollars,
  );
});

it("charges nothing for a request that never reached a model, whatever it reports", () => {
  expect(settledWeaponSpend({...outcomeWithCalls(0), usage: {inputTokens: 5, outputTokens: 5}})).toBe(0);
});

it("charges nothing for a request that never reached a model", () => {
  expect(settledWeaponSpend(outcomeWithCalls(0))).toBe(0);
});

it("reserves at least what the most model calls a request can make would settle at", () => {
  expect(WEAPON_SPEND.reservedMicrodollars).toBeGreaterThanOrEqual(
    settledWeaponSpend(outcomeWithCalls(WEAPON_SPEND.mostCalls)),
  );
});

it("prices a call at about what the Haiku evals measured, never at nothing", () => {
  expect(WEAPON_SPEND.perCallMicrodollars).toBeGreaterThanOrEqual(340);
  expect(WEAPON_SPEND.perCallMicrodollars).toBeLessThanOrEqual(1_000);
});

function outcomeWithCalls(modelCalls: number): WeaponOutcome {
  return {status: "created", nodes: [], modelCalls};
}
