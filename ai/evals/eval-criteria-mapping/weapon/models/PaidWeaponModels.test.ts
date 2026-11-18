import type {ChatAnthropic} from "@langchain/anthropic";
import {PAID_MODEL} from "@evals/eval-criteria-mapping/tier/paid/PaidModel";
import {paidSpendGuard} from "@evals/eval-criteria-mapping/tier/paid/spend/PaidSpendGuard";
import {createPaidWeaponModels} from "@evals/eval-criteria-mapping/weapon/models/PaidWeaponModels";

const keyInTheShell = process.env.ANTHROPIC_API_KEY;

// A dummy key, so building the models reads no file and makes no call. The shell's own key is put back afterwards.
beforeEach(() => {
  process.env.ANTHROPIC_API_KEY = "dummy-key-for-a-test";
});

afterEach(() => {
  if (keyInTheShell === undefined) {
    delete process.env.ANTHROPIC_API_KEY;
  } else {
    process.env.ANTHROPIC_API_KEY = keyInTheShell;
  }
});

it("writes with Haiku 5.5 and judges with Haiku 5.5", () => {
  const {generator, moderator} = createPaidWeaponModels();

  expect([generator.model, moderator.model]).toEqual([PAID_MODEL, PAID_MODEL]);
});

it("puts the one spend guard on the model that writes, so what it costs counts against the ceiling", () => {
  expect(carriesTheSharedGuard(createPaidWeaponModels().generator)).toBe(true);
});

it("puts the same spend guard on the model that judges, not a second one that would count on its own", () => {
  expect(carriesTheSharedGuard(createPaidWeaponModels().moderator)).toBe(true);
});

it("lets both models write far more than a weapon or a verdict needs, so a cut-off answer is not what a result says", () => {
  const {generator, moderator} = createPaidWeaponModels();

  expect(Math.min(generator.maxTokens ?? 0, moderator.maxTokens ?? 0)).toBeGreaterThanOrEqual(1000);
});

it("sets no temperature, which Haiku 5.5 refuses", () => {
  const {generator, moderator} = createPaidWeaponModels();

  expect([generator.temperature, moderator.temperature]).toEqual([undefined, undefined]);
});

function carriesTheSharedGuard(model: ChatAnthropic): boolean {
  const callbacks = model.callbacks;

  return Array.isArray(callbacks) && callbacks.includes(paidSpendGuard());
}
