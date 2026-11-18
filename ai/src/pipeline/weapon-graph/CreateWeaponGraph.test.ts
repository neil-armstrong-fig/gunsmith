import {FakeListChatModel} from "@langchain/core/utils/testing";
import {createWeaponGraph} from "@gunsmith/ai/pipeline/weapon-graph/CreateWeaponGraph";
import type {WeaponPipelineDependencies} from "@gunsmith/ai/pipeline/types/WeaponPipelineDependencies";
import type {WeaponGraph} from "@gunsmith/ai/pipeline/weapon-graph/types/WeaponGraph";

it("has one node for each step of the pipeline, and no other", () => {
  const stepIds = Object.keys(drawableGraph().nodes).filter(id => !id.startsWith("__"));

  expect(stepIds.sort()).toEqual([
    "balance",
    "draw",
    "generate",
    "moderation",
    "precheck",
    "rate",
    "repair",
    "validate",
  ]);
});

it("runs the steps in a fixed order, with a way out at every refusal and one road back through repair", () => {
  const roads = drawableGraph().edges.map(edge => `${edge.source} -> ${edge.target}`);

  expect(roads.sort()).toEqual([
    "__start__ -> precheck",
    "balance -> rate",
    "draw -> __end__",
    "generate -> validate",
    "moderation -> __end__",
    "moderation -> generate",
    "precheck -> __end__",
    "precheck -> moderation",
    "rate -> __end__",
    "rate -> draw",
    "rate -> repair",
    "repair -> validate",
    "validate -> __end__",
    "validate -> balance",
    "validate -> repair",
  ]);
});

function drawableGraph(): ReturnType<WeaponGraph["getGraph"]> {
  return createWeaponGraph(fakeWeaponPipelineDependencies()).getGraph();
}

function fakeWeaponPipelineDependencies(): WeaponPipelineDependencies {
  return {
    generator: new FakeListChatModel({responses: ["{}"]}),
    moderator: new FakeListChatModel({responses: ["{}"]}),
    appearanceGenerator: new FakeListChatModel({responses: ["{}"]}),
  };
}
