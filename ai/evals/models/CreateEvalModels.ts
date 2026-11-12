import {FakeListChatModel} from "@langchain/core/utils/testing";
import {ChatOllama} from "@langchain/ollama";
import type {EvalTier} from "@evals/models/types/EvalTier";
import type {WeaponPipelineDeps} from "@gunsmith/ai/pipeline/types/WeaponPipelineDeps";

const LOCAL_BASE_URL = "http://127.0.0.1:11434";
const LOCAL_MODEL = "qwen3.5:9b";

/** The models for one eval run. Only this file (and `ai/evals`) may import `@langchain/ollama`: `src/` is what the Worker bundles. */
export function createEvalModels(tier: EvalTier): WeaponPipelineDeps {
  if (tier === "fake") {
    return createFakeModels();
  }

  if (tier === "local") {
    return createLocalModels();
  }

  throw new Error(
    "The paid tier is not set up yet: it needs a provider key with its own hard cap (MANUAL-SETUP-STEPS.md step 8) and the " +
      "spend guard. Use the local tier.",
  );
}

function createFakeModels(): WeaponPipelineDeps {
  return {
    generator: new FakeListChatModel({responses: [JSON.stringify({name: "Proof Rifle", damage: 20, rateOfFire: 6})]}),
    moderator: new FakeListChatModel({responses: [JSON.stringify({isWeaponRequest: true})]}),
  };
}

// Temperature 0 and thinking off: repeatable output for a loop that has to be fast. This model build (qwen3.5:9b, NVFP4) has no
// constrained decoding: `format` fails with "structured output is unavailable" (checked 2026-11-12, Ollama 0.40.16). So the
// pipeline must ask for structure with `withStructuredOutput(schema, {method: "functionCalling"})`, which works, and which
// does not enforce the schema's limits: zod still parses the result, and the repair node still earns its place.
function createLocalModels(): WeaponPipelineDeps {
  const model = process.env.EVAL_LOCAL_MODEL ?? LOCAL_MODEL;
  const options = {baseUrl: LOCAL_BASE_URL, model, temperature: 0, think: false, numPredict: 400};

  return {generator: new ChatOllama(options), moderator: new ChatOllama({...options, numPredict: 100})};
}
