import {GENERATION_PROMPT} from "@gunsmith/ai/pipeline/appearance/drafting/generate/prompts/GenerationPrompt";
import {DETAIL_TIERS} from "@gunsmith/shared/appearance/vocabulary/detail/DetailTier";

it("names every detail tier a shape may have, since the model wrote others when told only one (79 refusals in 36 Haiku drawings)", () => {
  for (const tier of DETAIL_TIERS) {
    expect(GENERATION_PROMPT).toContain(`"${tier}"`);
  }
});

it("tells the model where its lines may reach, since a braid of tentacles ran off the canvas even after the repair named the overshoot (1 of 3 Haiku trials, 2026-11-20)", () => {
  expect(GENERATION_PROMPT).toContain("an x and y between 6 and 58");
});
