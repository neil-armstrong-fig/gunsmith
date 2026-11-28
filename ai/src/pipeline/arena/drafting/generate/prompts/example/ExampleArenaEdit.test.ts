import {BUILT_IN_ARENAS} from "@gunsmith/engine/arena/built-in/BuiltInArenas";
import {EXAMPLE_ARENA_EDIT} from "@gunsmith/ai/pipeline/arena/drafting/generate/prompts/example/ExampleArenaEdit";
import {validateArenaDraft} from "@gunsmith/ai/pipeline/arena/check/validate/ValidateArenaDraft";

it("is an edit the validator accepts, so the prompt only teaches edits the game plays", () => {
  expect(validateArenaDraft(EXAMPLE_ARENA_EDIT, "editBuiltIn").ok).toBe(true);
});

it("names a built-in arena and changes it, so a copy of the example is not an unchanged built-in", () => {
  const base = BUILT_IN_ARENAS.find(arena => arena.name === EXAMPLE_ARENA_EDIT.base);
  const validation = validateArenaDraft(EXAMPLE_ARENA_EDIT, "editBuiltIn");

  expect(base).toBeDefined();
  expect(validation.ok && validation.arena.rows).not.toEqual(base?.rows);
});
