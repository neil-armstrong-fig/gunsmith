import {validateArenaDraft} from "@gunsmith/ai/pipeline/arena/check/validate/ValidateArenaDraft";
import {EXAMPLE_ARENA} from "@gunsmith/ai/pipeline/arena/arena-drafting/generate/prompts/example/ExampleArena";

it("is an arena the validator accepts, so the prompt only teaches drawings the game plays", () => {
  expect(validateArenaDraft(EXAMPLE_ARENA)).toEqual({ok: true, arena: EXAMPLE_ARENA});
});
