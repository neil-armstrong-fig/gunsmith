import {FakeListChatModel} from "@langchain/core/utils/testing";
import {BUILT_IN_ARENAS} from "@gunsmith/engine/built-in-arenas/BuiltInArenas";
import {reasonForInvalidArena} from "@gunsmith/ai/pipeline/arena/arena-graph/outcome/invalid-reason/ReasonForInvalidArena";
import {generateArena} from "@gunsmith/ai/pipeline/arena/GenerateArena";
import type {ArenaPipelineDependencies} from "@gunsmith/ai/pipeline/arena/types/ArenaPipelineDependencies";

// None of these fake models reports tokens, so a request's usage is zero.
const NO_TOKENS = {inputTokens: 0, outputTokens: 0};

const GOOD = {name: "Plain Room", rows: ["##########", "#........#", "#........#", "#........#", "##########"]};
const OTHER_GOOD = {name: "Pillar Room", rows: ["##########", "#..#..#..#", "#........#", "#..#..#..#", "##########"]};
// Nearly all wall: not a fault the repair of drawings can mend (it makes no floor), so the model has to be asked again.
const BAD = {name: "Solid Block", rows: ["##########", "#...######", "##########", "##########", "##########"]};
const DUEL_NAME = BUILT_IN_ARENAS[0]?.name;
const ARENA_REQUEST = {isArenaRequest: true, reason: "pillars"};
const TOO_WIDE_SHAPES = {name: "Wide Room", width: 10, height: 5, walls: [{x: 8, y: 1, width: 4, height: 1}]};
const FIXED_SHAPES = {name: "Wide Room", width: 10, height: 5};

it("makes the arena the model drew when it passes every check, with two model calls and nothing refunded", async () => {
  const outcome = await generateArena({prompt: "a plain room"}, dependenciesWith([GOOD]));

  expect(outcome).toEqual({
    status: "created",
    arena: GOOD,
    refunded: false,
    nodes: ["precheck", "moderation", "generate", "validate"],
    modelCalls: 2,
    usage: NO_TOKENS,
    history: {pipelineVersion: "arena-v1", relevance: "accepted", codeEdits: 0, modelRepairs: 0},
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
    usage: NO_TOKENS,
    history: {pipelineVersion: "arena-v1", relevance: "accepted", codeEdits: 0, modelRepairs: 1},
  });
});

it("ends invalid with no arena and a reason of ours, refunding nothing, when the repair is refused too, without a second repair", async () => {
  const dependencies = dependenciesWith([BAD, BAD]);
  const invoke = vi.spyOn(dependencies.generator, "invoke");

  const outcome = await generateArena({prompt: "a room"}, dependencies);

  expect(outcome).toMatchObject({status: "invalid", refunded: false, modelCalls: 3});
  expect(outcome).not.toHaveProperty("arena");
  expect(outcome.reason).toBe(reasonForInvalidArena("unplayable-arena", ["tooWalled"]));
  expect(outcome.reason).toContain("too full of walls");
  expect(outcome.nodes).toEqual(["precheck", "moderation", "generate", "validate", "repair", "validate"]);
  expect(invoke).toHaveBeenCalledTimes(2);
  expect(outcome.history).toMatchObject({relevance: "accepted", validationFailure: "unplayable-arena"});
});

it("tells the player what the repair was refused for, not what the first draft was", async () => {
  const noFloor = {name: "Solid", rows: ["##########", "##########", "##########", "##########", "##########"]};
  const outcome = await generateArena({prompt: "a room"}, dependenciesWith([noFloor, BAD]));

  expect(outcome.status).toBe("invalid");
  expect(outcome.reason).toContain("too full of walls");
  expect(outcome.reason).not.toContain("no floor to stand on");
});

it("makes an arena the model described in shapes, drawn into rows, when the format is shapes", async () => {
  const shapes = {name: "Pillar Room", width: 10, height: 5, walls: [{x: 3, y: 1, width: 1, height: 1}]};
  const dependencies = {...dependenciesWith([shapes]), format: "shapes"} as const;

  const outcome = await generateArena({prompt: "a room with a pillar"}, dependencies);

  expect(outcome).toMatchObject({
    status: "created",
    arena: {name: "Pillar Room", rows: ["##########", "#..#.....#", "#........#", "#........#", "##########"]},
    modelCalls: 2,
    usage: NO_TOKENS,
  });
});

it("repairs shapes that reach past the arena in shapes, and makes the repaired arena", async () => {
  const tooWide = {name: "Wide Room", width: 10, height: 5, walls: [{x: 8, y: 1, width: 4, height: 1}]};
  const fixed = {name: "Wide Room", width: 10, height: 5, walls: [{x: 6, y: 1, width: 3, height: 1}]};
  const dependencies = {...dependenciesWith([tooWide, fixed]), format: "shapes"} as const;

  const outcome = await generateArena({prompt: "a wide room"}, dependencies);

  expect(outcome).toMatchObject({status: "created", refunded: false, modelCalls: 3});
});

it("asks for shapes on the first call and again on the repair when no format is given, the format that failed least on Haiku", async () => {
  const {generator, moderator} = dependenciesWith([TOO_WIDE_SHAPES, FIXED_SHAPES]);
  const calls = vi.spyOn(generator, "invoke");

  const outcome = await generateArena({prompt: "a wide room"}, {generator, moderator});

  expect(outcome).toMatchObject({status: "created", modelCalls: 3});
  expect(calls).toHaveBeenCalledTimes(2);
  for (const [messages] of calls.mock.calls) {
    expect(JSON.stringify(messages)).toContain("walls: a list of wall rectangles");
  }
});

it("asks for rows on the first call and again on the repair when the format is rows", async () => {
  const dependencies = dependenciesWith([BAD, OTHER_GOOD]);
  const calls = vi.spyOn(dependencies.generator, "invoke");

  await generateArena({prompt: "a room"}, dependencies);

  expect(calls).toHaveBeenCalledTimes(2);
  for (const [messages] of calls.mock.calls) {
    expect(JSON.stringify(messages)).toContain("the arena drawn as a list of text rows");
  }
});

it("asks for shapes, first and on the repair, for the blue style, whatever format the dependencies name", async () => {
  const dependencies = dependenciesWith([TOO_WIDE_SHAPES, FIXED_SHAPES]);
  const calls = vi.spyOn(dependencies.generator, "invoke");

  const outcome = await generateArena({prompt: "a wide room", style: "blue"}, dependencies);

  expect(outcome).toMatchObject({status: "created", modelCalls: 3});
  expect(calls).toHaveBeenCalledTimes(2);
  for (const [messages] of calls.mock.calls) {
    expect(JSON.stringify(messages)).toContain("walls: a list of wall rectangles");
  }
});

it("asks for an edit of a built-in arena, first and on the repair, for the red style, and makes the edited arena", async () => {
  const dependencies = dependenciesWith([
    {name: "Nowhere", base: "Moon Base"},
    {name: "Duel Plus", base: DUEL_NAME},
  ]);
  const calls = vi.spyOn(dependencies.generator, "invoke");

  const outcome = await generateArena({prompt: "a duel with more walls", style: "red"}, dependencies);

  expect(outcome).toMatchObject({status: "created", modelCalls: 3, arena: {name: "Duel Plus"}});
  expect(calls).toHaveBeenCalledTimes(2);
  for (const [messages] of calls.mock.calls) {
    expect(JSON.stringify(messages)).toContain("the name of the arena you start from");
  }
});

it("asks for shapes with a floor list, first and on the repair, and walls what lies outside the floor", async () => {
  const tooWide = {name: "Corner Room", width: 8, height: 5, floor: [{x: 1, y: 1, width: 9, height: 3}]};
  const fixed = {name: "Corner Room", width: 8, height: 5, floor: [{x: 1, y: 1, width: 5, height: 3}]};
  const dependencies = {...dependenciesWith([tooWide, fixed]), format: "shapes"} as const;
  const calls = vi.spyOn(dependencies.generator, "invoke");

  const outcome = await generateArena({prompt: "a corner room"}, dependencies);

  expect(outcome).toMatchObject({
    status: "created",
    modelCalls: 3,
    arena: {rows: ["########", "#.....##", "#.....##", "#.....##", "########"]},
  });
  expect(calls).toHaveBeenCalledTimes(2);
  for (const [messages] of calls.mock.calls) {
    expect(JSON.stringify(messages)).toContain("floor: a list of rectangles");
  }
});

it("keeps to the format the dependencies name when no style is asked for", async () => {
  const dependencies = dependenciesWith([GOOD]);
  const calls = vi.spyOn(dependencies.generator, "invoke");

  await generateArena({prompt: "a plain room"}, dependencies);

  expect(JSON.stringify(calls.mock.calls[0]?.[0])).toContain("the arena drawn as a list of text rows");
});

it("ends invalid, asking for a simpler description, when the model gives no answer at all, both times", async () => {
  const dependencies = dependenciesWith([GOOD]);
  vi.spyOn(dependencies.generator, "invoke").mockRejectedValue(new Error("connection refused"));

  const outcome = await generateArena({prompt: "a room"}, dependencies);

  expect(outcome).toMatchObject({status: "invalid", refunded: false, modelCalls: 3});
  expect(outcome.reason).toBe(reasonForInvalidArena("invalid-draft", []));
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
    usage: NO_TOKENS,
    history: {pipelineVersion: "arena-v1", relevance: "irrelevant", codeEdits: 0, modelRepairs: 0},
  });
  expect(invoke).not.toHaveBeenCalled();
});

it("turns away a request that is too long before any model is called", async () => {
  const dependencies = dependenciesWith([GOOD]);
  const moderate = vi.spyOn(dependencies.moderator, "invoke");

  const outcome = await generateArena({prompt: "x".repeat(1001)}, dependencies);

  expect(outcome).toMatchObject({status: "rejected", nodes: ["precheck"], modelCalls: 0, refunded: true});
  expect(moderate).not.toHaveBeenCalled();
});

// The fake generator answers in rows unless a test says otherwise, so the format is named: the pipeline's own default is shapes.
function dependenciesWith(generatorReplies: unknown[], verdict: unknown = ARENA_REQUEST): ArenaPipelineDependencies {
  return {
    generator: new FakeListChatModel({responses: generatorReplies.map(reply => JSON.stringify(reply))}),
    moderator: new FakeListChatModel({responses: [JSON.stringify(verdict)]}),
    format: "rows",
  };
}
