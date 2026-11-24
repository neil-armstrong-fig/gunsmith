import {validateNode} from "@gunsmith/ai/pipeline/arena/arena-graph/checking/ValidateNode";
import {arenaGraphStateOf} from "@gunsmith/ai/pipeline/arena/arena-graph/testing/ArenaGraphStateOf";

const GOOD = {name: "Plain Room", rows: ["##########", "#........#", "#........#", "#........#", "##########"]};

it("keeps a draft that passes as the arena and clears the last refusal", () => {
  const update = validateNode(arenaGraphStateOf({draft: GOOD, errors: ["old fault"]}), "rows");

  expect(update).toEqual({arena: GOOD, errors: [], nodes: ["validate"]});
});

it("refuses a draft with a sentence for each fault and keeps no arena", () => {
  const update = validateNode(arenaGraphStateOf({draft: {name: "B", rows: ["#"]}}), "rows");

  expect(update.arena).toBeUndefined();
  expect(update.errors).toHaveLength(3);
  expect(update.nodes).toEqual(["validate"]);
});

it("refuses a draft the model never gave", () => {
  expect(validateNode(arenaGraphStateOf({draft: undefined}), "rows").errors).toHaveLength(1);
});

it("never costs a model call", () => {
  expect(validateNode(arenaGraphStateOf({draft: GOOD}), "rows")).not.toHaveProperty("modelCalls");
});

it("reads the draft in the format it is given: shapes are drawn into the arena", () => {
  const update = validateNode(arenaGraphStateOf({draft: {name: "Plain Room", width: 10, height: 5}}), "shapes");

  expect(update.arena).toEqual(GOOD);
});
