import {FakeListChatModel} from "@langchain/core/utils/testing";
import {generateWeapon} from "@gunsmith/ai/pipeline/GenerateWeapon";
import {passingAppearance} from "@gunsmith/ai/pipeline/appearance/testing/PassingAppearance";
import {ToolCallingFakeModel} from "@gunsmith/ai/pipeline/appearance/testing/ToolCallingFakeModel";
import type {WeaponPipelineDependencies} from "@gunsmith/ai/pipeline/types/WeaponPipelineDependencies";

// None of these fake models reports tokens, so a request's usage is zero.
const NO_TOKENS = {inputTokens: 0, outputTokens: 0};

// Balancing never leaves a weapon over a limit, so the backstop behind it can only be reached by a balancer that fails. This file
// stands in one that does, to prove `rate` still refuses what it is handed, that the refusal goes to the one repair like any other,
// and that a weapon still over a limit after it is invalid and is never drawn.
vi.mock("@gunsmith/ai/pipeline/check/balance/BalanceWeaponDraft", () => ({
  balanceWeaponDraft: (weapon: unknown) => weapon,
}));

const TOO_STRONG = {
  name: "Everything",
  bulletDamage: 100,
  fireIntervalSeconds: 0.05,
  bulletSpeed: 60,
  magazineSize: 60,
  reloadSeconds: 0.5,
  startingReserve: 200,
  visionDegrees: 130,
  visionRange: 20,
};

it("is invalid, repaired once, drawn never, when balancing leaves a weapon over a limit both times", async () => {
  const weaponPipelineDependencies: WeaponPipelineDependencies = {
    generator: new FakeListChatModel({responses: [JSON.stringify(TOO_STRONG)]}),
    moderator: new FakeListChatModel({responses: [JSON.stringify({isWeaponRequest: true, reason: "a gun"})]}),
    appearanceGenerator: new ToolCallingFakeModel({answers: [passingAppearance()]}),
  };
  const generatorCall = vi.spyOn(weaponPipelineDependencies.generator, "invoke");
  const appearanceCall = vi.spyOn(weaponPipelineDependencies.appearanceGenerator, "invoke");

  const outcome = await generateWeapon({prompt: "everything at once"}, weaponPipelineDependencies);

  expect(outcome).toEqual({
    status: "invalid",
    reason: "We could not build a valid weapon from that request. Try describing it differently.",
    nodes: [
      "precheck",
      "moderation",
      "generate",
      "validate",
      "balance",
      "rate",
      "repair",
      "validate",
      "balance",
      "rate",
    ],
    modelCalls: 3,
    usage: NO_TOKENS,
    history: {
      pipelineVersion: "weapon-v1",
      relevance: "accepted",
      codeEdits: 0,
      modelRepairs: 1,
      validationFailure: "rating-out-of-bounds",
    },
  });
  expect(generatorCall).toHaveBeenCalledTimes(2);
  expect(appearanceCall).not.toHaveBeenCalled();
});
