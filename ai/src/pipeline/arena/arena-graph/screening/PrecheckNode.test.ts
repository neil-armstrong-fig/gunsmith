import {precheckNode} from "@gunsmith/ai/pipeline/arena/arena-graph/screening/PrecheckNode";
import {arenaGraphStateOf} from "@gunsmith/ai/pipeline/arena/arena-graph/testing/ArenaGraphStateOf";

it("lets an ordinary request through without turning it away", () => {
  expect(precheckNode(arenaGraphStateOf({prompt: "an arena with pillars"}))).toEqual({nodes: ["precheck"]});
});

it("lets a request exactly at the arena limit through", () => {
  expect(precheckNode(arenaGraphStateOf({prompt: "x".repeat(1000)}))).toEqual({nodes: ["precheck"]});
});

it("turns away a request one character over the limit, saying how long it is", () => {
  const update = precheckNode(arenaGraphStateOf({prompt: "x".repeat(1001)}));

  expect(update).toEqual({
    nodes: ["precheck"],
    rejectionReason: "That is too long: about 251 tokens, and the limit is 250. Shorten it.",
  });
});

it("turns away an empty request in the arena's own words", () => {
  expect(precheckNode(arenaGraphStateOf({prompt: "  "})).rejectionReason).toBe("Describe the arena you want.");
});

it("never costs a model call", () => {
  expect(precheckNode(arenaGraphStateOf({prompt: ""}))).not.toHaveProperty("modelCalls");
});
