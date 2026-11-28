import {validateArenaDraft} from "@gunsmith/ai/pipeline/arena/check/validate/ValidateArenaDraft";
import {EXAMPLE_ARENA} from "@gunsmith/ai/pipeline/arena/drafting/generate/prompts/example/ExampleArena";

it("is an arena the validator accepts, so the prompt only teaches drawings the game plays", () => {
  expect(validateArenaDraft(EXAMPLE_ARENA, "rows")).toEqual({ok: true, arena: EXAMPLE_ARENA, codeEdits: 0});
});

it("draws no cover block, so an arena that has one was the model's choice and not a copy of the example", () => {
  expect(EXAMPLE_ARENA.rows.join("")).not.toContain("c");
});
