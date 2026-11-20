import {consumeCallback} from "@langchain/core/callbacks/promises";
import {FakeListChatModel} from "@langchain/core/utils/testing";
import {generateWeapon} from "@gunsmith/ai/pipeline/GenerateWeapon";
import {passingAppearance} from "@gunsmith/ai/pipeline/appearance/testing/PassingAppearance";
import {ToolCallingFakeModel} from "@gunsmith/ai/pipeline/appearance/testing/ToolCallingFakeModel";
import {reportUsage} from "@gunsmith/ai/pipeline/testing/ReportUsage";
import type {WeaponPipelineDependencies} from "@gunsmith/ai/pipeline/types/WeaponPipelineDependencies";

const RIFLE = {
  name: "Proof Rifle",
  bulletDamage: 24,
  fireIntervalSeconds: 0.2,
  bulletSpeed: 20,
  magazineSize: 12,
  reloadSeconds: 1.5,
  startingReserve: 36,
};

const MODERATION = {inputTokens: 100, outputTokens: 10};
const GENERATION = {inputTokens: 200, outputTokens: 50};
const DRAWING = {inputTokens: 300, outputTokens: 90};

it("adds up the tokens of moderation, generation and the drawing, each counted once", async () => {
  const outcome = await generateWeapon({prompt: "a mild rifle"}, dependenciesWhere({generatorSays: [RIFLE]}));

  expect(outcome.modelCalls).toBe(3);
  expect(outcome.usage).toEqual({inputTokens: 600, outputTokens: 150});
});

it("counts the repair's tokens as well, because the repair is billed like any call", async () => {
  const outcome = await generateWeapon({prompt: "a mild rifle"}, dependenciesWhere({generatorSays: [{}, RIFLE]}));

  expect(outcome.modelCalls).toBe(4);
  expect(outcome.usage).toEqual({inputTokens: 800, outputTokens: 200});
});

it("counts only the moderation call for a request that is turned away", async () => {
  const dependencies = dependenciesWhere({generatorSays: [RIFLE], isWeaponRequest: false});

  const outcome = await generateWeapon({prompt: "a lasagna recipe"}, dependencies);

  expect(outcome.modelCalls).toBe(1);
  expect(outcome.usage).toEqual(MODERATION);
});

it("reports no tokens for a request turned away before any model is called", async () => {
  const outcome = await generateWeapon({prompt: "a rifle ".repeat(200)}, dependenciesWhere({generatorSays: [RIFLE]}));

  expect(outcome.modelCalls).toBe(0);
  expect(outcome.usage).toEqual({inputTokens: 0, outputTokens: 0});
});

// LangChain runs a handler that does not ask to be awaited on one shared background queue, behind every handler queued before it (a
// tracer's, another request's). A total read while that queue is busy would be short, so the collector makes the graph wait for it.
it("counts every token even while LangChain's background callback queue is busy", async () => {
  await consumeCallback(() => new Promise(resolve => setTimeout(resolve, 40)), false);

  const outcome = await generateWeapon({prompt: "a mild rifle"}, dependenciesWhere({generatorSays: [RIFLE]}));

  expect(outcome.usage).toEqual({inputTokens: 600, outputTokens: 150});
});

interface UsageScenario {
  generatorSays: unknown[];
  isWeaponRequest?: boolean;
}

function dependenciesWhere(scenario: UsageScenario): WeaponPipelineDependencies {
  const verdict = {isWeaponRequest: scenario.isWeaponRequest ?? true, reason: "a verdict"};
  const dependencies: WeaponPipelineDependencies = {
    moderator: new FakeListChatModel({responses: [JSON.stringify(verdict)]}),
    generator: new FakeListChatModel({responses: scenario.generatorSays.map(reply => JSON.stringify(reply))}),
    appearanceGenerator: new ToolCallingFakeModel({answers: [passingAppearance()], usage: DRAWING}),
  };
  reportUsage(dependencies.moderator, MODERATION);
  reportUsage(dependencies.generator, GENERATION);

  return dependencies;
}
