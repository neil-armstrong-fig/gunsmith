import {validateNode} from "@gunsmith/ai/pipeline/arena/arena-graph/checking/ValidateNode";
import {arenaGraphStateOf} from "@gunsmith/ai/pipeline/arena/arena-graph/testing/ArenaGraphStateOf";

const GOOD = {name: "Plain Room", rows: ["##########", "#........#", "#........#", "#........#", "##########"]};

it("keeps a draft that passes as the arena and clears the last refusal", () => {
  const update = validateNode(arenaGraphStateOf({draft: GOOD, errors: ["old fault"]}));

  expect(update).toEqual({arena: GOOD, errors: [], nodes: ["validate"]});
});

it("refuses a draft with a sentence for each fault and keeps no arena", () => {
  const update = validateNode(arenaGraphStateOf({draft: {name: "B", rows: ["#"]}}));

  expect(update.arena).toBeUndefined();
  expect(update.errors).toHaveLength(3);
  expect(update.nodes).toEqual(["validate"]);
});

it("refuses a draft the model never gave", () => {
  expect(validateNode(arenaGraphStateOf({draft: undefined})).errors).toHaveLength(1);
});

it("never costs a model call", () => {
  expect(validateNode(arenaGraphStateOf({draft: GOOD}))).not.toHaveProperty("modelCalls");
});
