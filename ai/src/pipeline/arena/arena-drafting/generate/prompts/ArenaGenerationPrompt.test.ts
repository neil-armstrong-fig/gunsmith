import {ARENA_GENERATION_PROMPT} from "@gunsmith/ai/pipeline/arena/arena-drafting/generate/prompts/ArenaGenerationPrompt";

it("puts the cover block (c) in the legend, with what it does to a fighter standing and crouching", () => {
  const legend = ARENA_GENERATION_PROMPT.split("\n").find(line => line.startsWith("- c "));

  expect(legend).toMatch(/low/);
  expect(legend).toMatch(/shoot over/);
  expect(legend).toMatch(/crouch/);
});

it("does not call a wall cover, because a wall is not low", () => {
  expect(ARENA_GENERATION_PROMPT).not.toMatch(/cover \(walls\)/);
});
