import {ChatOllama} from "@langchain/ollama";
import {BUILT_IN_ARENA_FIXTURES} from "@evals/eval-criteria-mapping/arena/models/built-ins/BuiltInArenaFixtures";
import {ArenaModerationFakeModel} from "@evals/eval-criteria-mapping/arena/models/fake/ArenaModerationFakeModel";
import {unreachableTier} from "@evals/eval-criteria-mapping/tier/UnreachableTier";
import type {EvalTier} from "@evals/eval-criteria-mapping/tier/types/EvalTier";
import type {ArenaSubmissionDependencies} from "@gunsmith/ai/pipeline/arena-submission/types/ArenaSubmissionDependencies";

const LOCAL_BASE_URL = "http://127.0.0.1:11434";
const LOCAL_MODEL = "qwen3.5:9b";

/** The models for one arena-submission eval run. Only `ai/evals` may import `@langchain/ollama`: `src/` is what the Worker bundles. */
export function createArenaSubmissionEvalModels(tier: EvalTier): ArenaSubmissionDependencies {
  if (tier === "fake") {
    return {moderator: new ArenaModerationFakeModel(), builtInArenas: BUILT_IN_ARENA_FIXTURES};
  }

  if (tier === "local") {
    return createLocalModels();
  }

  if (tier === "paid") {
    throw new Error(
      "The arena-submission evals have no paid tier yet: a paid call needs the user to review its cost first (TODO-ai.md, paid-spend ledger).",
    );
  }

  return unreachableTier(tier);
}

// Temperature 0 and thinking off, as the arena's local models. The only model call is the moderation verdict, a boolean and a sentence.
function createLocalModels(): ArenaSubmissionDependencies {
  const model = process.env.EVAL_LOCAL_MODEL ?? LOCAL_MODEL;
  const moderator = new ChatOllama({baseUrl: LOCAL_BASE_URL, model, temperature: 0, think: false, numPredict: 100});

  return {moderator, builtInArenas: BUILT_IN_ARENA_FIXTURES};
}
