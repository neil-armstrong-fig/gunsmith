import {FakeListChatModel} from "@langchain/core/utils/testing";
import {createArenaGraph} from "@gunsmith/ai/pipeline/arena/arena-graph/CreateArenaGraph";
import type {ArenaGraph} from "@gunsmith/ai/pipeline/arena/arena-graph/types/ArenaGraph";
import type {ArenaPipelineDependencies} from "@gunsmith/ai/pipeline/arena/types/ArenaPipelineDependencies";

function fakeArenaPipelineDependencies(): ArenaPipelineDependencies {
  return {
    generator: new FakeListChatModel({responses: ["{}"]}),
    moderator: new FakeListChatModel({responses: ["{}"]}),
    builtInArenas: [{name: "Open Room", rows: ["#####", "#...#", "#####"]}],
  };
}

function drawableGraph(): ReturnType<ArenaGraph["getGraph"]> {
  return createArenaGraph(fakeArenaPipelineDependencies()).getGraph();
}

it("has one node for each step of the pipeline, and no other", () => {
  const stepIds = Object.keys(drawableGraph().nodes).filter(id => !id.startsWith("__"));

  expect(stepIds.sort()).toEqual(["fallback", "generate", "moderation", "precheck", "repair", "validate"]);
});

it("runs the steps in a fixed order, with a way out at every refusal, one road back through repair and one to the built-in arena", () => {
  const roads = drawableGraph().edges.map(edge => `${edge.source} -> ${edge.target}`);

  expect(roads.sort()).toEqual([
    "__start__ -> precheck",
    "fallback -> __end__",
    "generate -> validate",
    "moderation -> __end__",
    "moderation -> generate",
    "precheck -> __end__",
    "precheck -> moderation",
    "repair -> validate",
    "validate -> __end__",
    "validate -> fallback",
    "validate -> repair",
  ]);
});
