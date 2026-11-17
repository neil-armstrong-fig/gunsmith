import {fallbackNode} from "@gunsmith/ai/pipeline/arena/arena-graph/fallback/FallbackNode";
import {arenaGraphStateOf} from "@gunsmith/ai/pipeline/arena/arena-graph/testing/ArenaGraphStateOf";

const BUILT_IN = {name: "Open Room", rows: ["#####", "#...#", "#####"]};

it("gives a built-in arena and notes that it ran, without costing a model call", () => {
  const update = fallbackNode(arenaGraphStateOf({repaired: true, errors: ["rows: too few"]}), [BUILT_IN]);

  expect(update).toEqual({builtIn: BUILT_IN, nodes: ["fallback"]});
});

it("fails loudly when the pipeline was built with no built-in arena", () => {
  expect(() => fallbackNode(arenaGraphStateOf(), [])).toThrow("no built-in arena");
});
