import {FakeListChatModel} from "@langchain/core/utils/testing";
import {generateArena} from "@gunsmith/ai/pipeline/arena/GenerateArena";
import type {ArenaPipelineDependencies} from "@gunsmith/ai/pipeline/arena/types/ArenaPipelineDependencies";
import {reportUsage} from "@gunsmith/ai/pipeline/testing/ReportUsage";

const GOOD = {name: "Plain Room", rows: ["##########", "#........#", "#........#", "#........#", "##########"]};
// Nearly all wall: not a fault the repair of drawings can mend (it makes no floor), so the model has to be asked again.
const BAD = {name: "Solid Block", rows: ["##########", "#...######", "##########", "##########", "##########"]};

const MODERATION = {inputTokens: 100, outputTokens: 10};
const DRAWING = {inputTokens: 200, outputTokens: 50};

it("adds up the tokens of moderation and generation, each counted once", async () => {
  const outcome = await generateArena({prompt: "a plain room"}, dependenciesWhere({generatorSays: [GOOD]}));

  expect(outcome.modelCalls).toBe(2);
  expect(outcome.usage).toEqual({inputTokens: 300, outputTokens: 60});
});

it("counts the repair's tokens as well, even when the request then ends invalid", async () => {
  const outcome = await generateArena({prompt: "a room"}, dependenciesWhere({generatorSays: [BAD, BAD]}));

  expect(outcome.status).toBe("invalid");
  expect(outcome.modelCalls).toBe(3);
  expect(outcome.usage).toEqual({inputTokens: 500, outputTokens: 110});
});

it("counts only the moderation call for a request that is turned away", async () => {
  const outcome = await generateArena(
    {prompt: "a lasagna recipe"},
    dependenciesWhere({generatorSays: [GOOD], isArenaRequest: false}),
  );

  expect(outcome.modelCalls).toBe(1);
  expect(outcome.usage).toEqual(MODERATION);
});

it("reports no tokens for a request turned away before any model is called", async () => {
  const outcome = await generateArena({prompt: "a room ".repeat(400)}, dependenciesWhere({generatorSays: [GOOD]}));

  expect(outcome.modelCalls).toBe(0);
  expect(outcome.usage).toEqual({inputTokens: 0, outputTokens: 0});
});

interface UsageScenario {
  generatorSays: unknown[];
  isArenaRequest?: boolean;
}

function dependenciesWhere(scenario: UsageScenario): ArenaPipelineDependencies {
  const verdict = {isArenaRequest: scenario.isArenaRequest ?? true, reason: "a verdict"};
  const dependencies: ArenaPipelineDependencies = {
    moderator: new FakeListChatModel({responses: [JSON.stringify(verdict)]}),
    generator: new FakeListChatModel({responses: scenario.generatorSays.map(reply => JSON.stringify(reply))}),
    format: "rows",
  };
  reportUsage(dependencies.moderator, MODERATION);
  reportUsage(dependencies.generator, DRAWING);

  return dependencies;
}
