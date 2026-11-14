import {GENERATION_PROMPT} from "@gunsmith/ai/pipeline/appearance/drafting/generate/prompts/GenerationPrompt";
import {DETAIL_TIERS} from "@gunsmith/ai/pipeline/appearance/vocabulary/detail/DetailTier";

it("names every detail tier a shape may have, since the model wrote others when told only one (79 refusals in 36 Haiku drawings)", () => {
  for (const tier of DETAIL_TIERS) {
    expect(GENERATION_PROMPT).toContain(`"${tier}"`);
  }
});
