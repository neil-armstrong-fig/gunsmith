import {validateArenaDraft} from "@gunsmith/ai/pipeline/arena/check/validate/ValidateArenaDraft";
import {EXAMPLE_ARENA_SHAPES} from "@gunsmith/ai/pipeline/arena/arena-shapes/example/ExampleArenaShapes";

it("is an arena the validator accepts, so the prompt only teaches shapes the game plays", () => {
  expect(validateArenaDraft(EXAMPLE_ARENA_SHAPES, "shapes").ok).toBe(true);
});

it("draws no cover block, so an arena that has one was the model's choice and not a copy of the example", () => {
  expect(EXAMPLE_ARENA_SHAPES.covers).toBeUndefined();
});
