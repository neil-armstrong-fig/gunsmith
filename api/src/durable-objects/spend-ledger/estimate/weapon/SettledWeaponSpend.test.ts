import type {WeaponOutcome} from "@gunsmith/ai/pipeline/types/WeaponOutcome";
import {pricedUsage} from "@src/durable-objects/spend-ledger/estimate/tokens/PricedUsage";
import {WEAPON_SPEND} from "@src/durable-objects/spend-ledger/estimate/weapon/WeaponSpend";
import {settledWeaponSpend} from "@src/durable-objects/spend-ledger/estimate/weapon/SettledWeaponSpend";

it("settles a request at the model calls it made, each at the estimated price of a call", () => {
  expect(settledWeaponSpend(outcomeWithCalls(3))).toBe(3 * WEAPON_SPEND.perCallMicrodollars);
  expect(settledWeaponSpend(outcomeWithCalls(1))).toBe(WEAPON_SPEND.perCallMicrodollars);
});

it("charges nothing for a request that never reached a model", () => {
  expect(settledWeaponSpend(outcomeWithCalls(0))).toBe(0);
});

it("settles at the tokens the models reported, priced, whatever the number of calls", () => {
  const reported = {inputTokens: 2_000, outputTokens: 300};

  expect(settledWeaponSpend({...outcomeWithCalls(5), usage: reported})).toBe(pricedUsage(reported));
  expect(settledWeaponSpend({...outcomeWithCalls(1), usage: reported})).toBe(350);
});

it("falls back to the price of a call when the models reported no tokens", () => {
  const nothingReported = {inputTokens: 0, outputTokens: 0};

  expect(settledWeaponSpend({...outcomeWithCalls(3), usage: nothingReported})).toBe(
    3 * WEAPON_SPEND.perCallMicrodollars,
  );
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
