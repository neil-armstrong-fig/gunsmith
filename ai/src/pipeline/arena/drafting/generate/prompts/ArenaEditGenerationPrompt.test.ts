import {BUILT_IN_ARENAS} from "@gunsmith/engine/arena/built-in/BuiltInArenas";
import {ARENA_EDIT_GENERATION_PROMPT} from "@gunsmith/ai/pipeline/arena/drafting/generate/prompts/ArenaEditGenerationPrompt";
import {EDIT_BASES} from "@gunsmith/ai/pipeline/arena/drafting/format/edit-built-in/bases/EditBases";

it("draws every base the format offers, with the line that says what it is", () => {
  for (const {arena, description} of EDIT_BASES) {
    expect(ARENA_EDIT_GENERATION_PROMPT).toContain(`"${arena.name}"`);
    expect(ARENA_EDIT_GENERATION_PROMPT).toContain(description);
    expect(ARENA_EDIT_GENERATION_PROMPT).toContain(arena.rows.join("\n"));
  }
});

it("draws no built-in arena the format does not offer", () => {
  const notOffered = BUILT_IN_ARENAS.filter(arena => !EDIT_BASES.some(base => base.arena === arena));

  expect(notOffered.filter(arena => ARENA_EDIT_GENERATION_PROMPT.includes(arena.rows.join("\n")))).toEqual([]);
});
