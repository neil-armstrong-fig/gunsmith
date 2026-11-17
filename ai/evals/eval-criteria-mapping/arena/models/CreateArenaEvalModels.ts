import {ChatOllama} from "@langchain/ollama";
import {BUILT_IN_ARENA_FIXTURES} from "@evals/eval-criteria-mapping/arena/models/built-ins/BuiltInArenaFixtures";
import {ArenaGenerationFakeModel} from "@evals/eval-criteria-mapping/arena/models/fake/ArenaGenerationFakeModel";
import {ArenaModerationFakeModel} from "@evals/eval-criteria-mapping/arena/models/fake/ArenaModerationFakeModel";
import {unreachableTier} from "@evals/eval-criteria-mapping/tier/UnreachableTier";
import type {EvalTier} from "@evals/eval-criteria-mapping/tier/types/EvalTier";
import type {ArenaPipelineDependencies} from "@gunsmith/ai/pipeline/arena/types/ArenaPipelineDependencies";

const LOCAL_BASE_URL = "http://127.0.0.1:11434";
const LOCAL_MODEL = "qwen3.5:9b";

/** The models for one arena eval run. Only `ai/evals` may import `@langchain/ollama`: `src/` is what the Worker bundles. */
export function createArenaEvalModels(tier: EvalTier): ArenaPipelineDependencies {
  if (tier === "fake") {
    return createFakeModels();
  }

  if (tier === "local") {
    return createLocalModels();
  }

  if (tier === "paid") {
    throw new Error(
      "The arena evals have no paid tier yet: a paid call needs the user to review its cost first (TODO-ai.md, paid-spend ledger).",
    );
  }

  return unreachableTier(tier);
}

function createFakeModels(): ArenaPipelineDependencies {
  return {
    generator: new ArenaGenerationFakeModel(),
    moderator: new ArenaModerationFakeModel(),
    builtInArenas: BUILT_IN_ARENA_FIXTURES,
  };
}

// Temperature 0 and thinking off, as the weapon's local models: repeatable output for a loop that has to be fast. An arena is
// a few hundred tokens of rows, so the generator is given far more room than a weapon's stats.
function createLocalModels(): ArenaPipelineDependencies {
  const model = process.env.EVAL_LOCAL_MODEL ?? LOCAL_MODEL;
  const options = {baseUrl: LOCAL_BASE_URL, model, temperature: 0, think: false, numPredict: 1500};

  return {
    generator: new ChatOllama(options),
    moderator: new ChatOllama({...options, numPredict: 100}),
    builtInArenas: BUILT_IN_ARENA_FIXTURES,
  };
}
