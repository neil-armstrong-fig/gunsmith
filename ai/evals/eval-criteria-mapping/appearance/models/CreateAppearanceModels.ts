import {ChatOllama} from "@langchain/ollama";
import {passingAppearance} from "@gunsmith/ai/pipeline/appearance/testing/PassingAppearance";
import {ToolCallingFakeModel} from "@gunsmith/ai/pipeline/appearance/testing/ToolCallingFakeModel";
import type {AppearanceDependencies} from "@gunsmith/ai/pipeline/appearance/types/AppearanceDependencies";
import {createPaidAppearanceModel} from "@evals/eval-criteria-mapping/appearance/models/PaidAppearanceModel";
import type {EvalTier} from "@evals/eval-criteria-mapping/tier/types/EvalTier";

const LOCAL_BASE_URL = "http://127.0.0.1:11434";
const LOCAL_MODEL = "qwen3.5:9b";

/** The model that draws, for one eval run. Only this file and `CreateEvalModels` (and `ai/evals`) may import `@langchain/ollama`. */
export function createAppearanceModels(tier: EvalTier): AppearanceDependencies {
  if (tier === "fake") {
    return {generator: new ToolCallingFakeModel({answers: [passingAppearance()]})};
  }

  if (tier === "local") {
    return {generator: createLocalGenerator()};
  }

  return {generator: createPaidAppearanceModel()};
}

// Not the weapon's settings: a drawing is about a thousand tokens, so the weapon's 400-token budget would cut it off, and at
// temperature 0 every trial would be a copy of the first, which defeats trials (measured 2026-11-13). Thinking off, as for the weapon.
function createLocalGenerator(): ChatOllama {
  return new ChatOllama({
    baseUrl: LOCAL_BASE_URL,
    model: process.env.EVAL_LOCAL_MODEL ?? LOCAL_MODEL,
    temperature: 0.7,
    think: false,
    numPredict: 3000,
  });
}
