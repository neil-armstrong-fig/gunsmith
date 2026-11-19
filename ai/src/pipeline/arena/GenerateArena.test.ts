import {FakeListChatModel} from "@langchain/core/utils/testing";
import {generateArena} from "@gunsmith/ai/pipeline/arena/GenerateArena";
import type {ArenaPipelineDependencies} from "@gunsmith/ai/pipeline/arena/types/ArenaPipelineDependencies";

const GOOD = {name: "Plain Room", rows: ["##########", "#........#", "#........#", "#........#", "##########"]};
const OTHER_GOOD = {name: "Pillar Room", rows: ["##########", "#..#..#..#", "#........#", "#..#..#..#", "##########"]};
const BAD = {name: "Cut In Two", rows: ["##########", "#...#....#", "#...#....#", "#...#....#", "##########"]};
const BUILT_IN = {name: "Open Room", rows: ["##########", "#........#", "#........#", "#........#", "##########"]};
const ARENA_REQUEST = {isArenaRequest: true, reason: "pillars"};

it("makes the arena the model drew when it passes every check, with two model calls and nothing refunded", async () => {
  const outcome = await generateArena({prompt: "a plain room"}, dependenciesWith([GOOD]));

  expect(outcome).toEqual({
    status: "created",
    arena: GOOD,
    refunded: false,
    nodes: ["precheck", "moderation", "generate", "validate"],
    modelCalls: 2,
  });
});

it("repairs a refused arena once, checks the repair, and makes it when it passes", async () => {
  const outcome = await generateArena({prompt: "a room"}, dependenciesWith([BAD, OTHER_GOOD]));

  expect(outcome).toEqual({
    status: "created",
    arena: OTHER_GOOD,
    refunded: false,
    nodes: ["precheck", "moderation", "generate", "validate", "repair", "validate"],
    modelCalls: 3,
  });
});

it("gives a built-in arena and refunds the credit when the repair is refused too, without a second repair", async () => {
  const dependencies = dependenciesWith([BAD, BAD]);
  const invoke = vi.spyOn(dependencies.generator, "invoke");

  const outcome = await generateArena({prompt: "a room"}, dependencies);

  expect(outcome).toMatchObject({status: "builtIn", arena: BUILT_IN, refunded: true, modelCalls: 3});
  expect(outcome.nodes).toEqual(["precheck", "moderation", "generate", "validate", "repair", "validate", "fallback"]);
  expect(invoke).toHaveBeenCalledTimes(2);
});

it("makes an arena the model described in shapes, drawn into rows, when the format is shapes", async () => {
  const shapes = {name: "Pillar Room", width: 10, height: 5, walls: [{x: 3, y: 1, width: 1, height: 1}]};
  const dependencies = {...dependenciesWith([shapes]), format: "shapes"} as const;

  const outcome = await generateArena({prompt: "a room with a pillar"}, dependencies);

  expect(outcome).toMatchObject({
    status: "created",
    arena: {name: "Pillar Room", rows: ["##########", "#..#.....#", "#........#", "#........#", "##########"]},
    modelCalls: 2,
  });
});

it("repairs shapes that reach past the arena in shapes, and makes the repaired arena", async () => {
  const tooWide = {name: "Wide Room", width: 10, height: 5, walls: [{x: 8, y: 1, width: 4, height: 1}]};
  const fixed = {name: "Wide Room", width: 10, height: 5, walls: [{x: 6, y: 1, width: 3, height: 1}]};
  const dependencies = {...dependenciesWith([tooWide, fixed]), format: "shapes"} as const;

  const outcome = await generateArena({prompt: "a wide room"}, dependencies);

  expect(outcome).toMatchObject({status: "created", refunded: false, modelCalls: 3});
});

it("asks for shapes on the first call and again on the repair, and for rows when no format is given", async () => {
  const tooWide = {name: "Wide Room", width: 10, height: 5, walls: [{x: 8, y: 1, width: 4, height: 1}]};
  const fixed = {name: "Wide Room", width: 10, height: 5};
  const shapesDependencies = {...dependenciesWith([tooWide, fixed]), format: "shapes"} as const;
  const shapesCalls = vi.spyOn(shapesDependencies.generator, "invoke");
  const rowsDependencies = dependenciesWith([GOOD]);
  const rowsCalls = vi.spyOn(rowsDependencies.generator, "invoke");

  await generateArena({prompt: "a wide room"}, shapesDependencies);
  await generateArena({prompt: "a room"}, rowsDependencies);

  expect(shapesCalls).toHaveBeenCalledTimes(2);
  for (const [messages] of shapesCalls.mock.calls) {
    expect(JSON.stringify(messages)).toContain("walls: a list of wall rectangles");
  }
  expect(JSON.stringify(rowsCalls.mock.calls[0]?.[0])).toContain("the arena drawn as a list of text rows");
});

it("falls back when the model gives no answer at all, both times", async () => {
  const dependencies = dependenciesWith([GOOD]);
  vi.spyOn(dependencies.generator, "invoke").mockRejectedValue(new Error("connection refused"));

  const outcome = await generateArena({prompt: "a room"}, dependencies);

  expect(outcome).toMatchObject({status: "builtIn", refunded: true, modelCalls: 3});
});

it("turns away a request that is not about an arena after one model call, and never asks the generator", async () => {
  const dependencies = dependenciesWith([GOOD], {isArenaRequest: false, reason: "That is a recipe."});
  const invoke = vi.spyOn(dependencies.generator, "invoke");

  const outcome = await generateArena({prompt: "give me a recipe"}, dependencies);

  expect(outcome).toEqual({
    status: "rejected",
    reason: "That is a recipe.",
    refunded: false,
    nodes: ["precheck", "moderation"],
    modelCalls: 1,
  });
  expect(invoke).not.toHaveBeenCalled();
});

it("turns away a request that is too long before any model is called", async () => {
  const dependencies = dependenciesWith([GOOD]);
  const moderate = vi.spyOn(dependencies.moderator, "invoke");

  const outcome = await generateArena({prompt: "x".repeat(1001)}, dependencies);

  expect(outcome).toMatchObject({status: "rejected", nodes: ["precheck"], modelCalls: 0});
  expect(moderate).not.toHaveBeenCalled();
});

function dependenciesWith(generatorReplies: unknown[], verdict: unknown = ARENA_REQUEST): ArenaPipelineDependencies {
  return {
    generator: new FakeListChatModel({responses: generatorReplies.map(reply => JSON.stringify(reply))}),
    moderator: new FakeListChatModel({responses: [JSON.stringify(verdict)]}),
    builtInArenas: [BUILT_IN],
  };
}
