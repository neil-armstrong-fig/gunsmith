import type {WeaponPipelineDependencies} from "@gunsmith/ai/pipeline/types/WeaponPipelineDependencies";
import {createLocalChatModel} from "@evals/eval-criteria-mapping/environment/tier/local/CreateLocalChatModel";
import {LOCAL_TRIALS} from "@evals/eval-criteria-mapping/environment/tier/local/LocalTrials";
import {fakeAppearanceGenerator} from "@evals/eval-criteria-mapping/setups/appearance/fake/FakeAppearanceGenerator";
import {WeaponPipelineEvalDriver} from "@evals/eval-criteria-mapping/setups/weapon/shared/WeaponPipelineEvalDriver";

/** The weapon pipeline on the local model: free but not fully repeatable, so several trials. */
export class LocalWeaponPipelineEvalDriver extends WeaponPipelineEvalDriver {
  constructor(requestedTrials: string | undefined) {
    super(requestedTrials, LOCAL_TRIALS);
  }

  // Temperature 0 and thinking off: repeatable output for a loop that has to be fast. This model build (qwen3.5:9b, NVFP4) has no
  // constrained decoding: `format` fails with "structured output is unavailable" (checked 2026-11-12, Ollama 0.40.16). So the
  // pipeline must ask for structure with `withStructuredOutput(schema, {method: "functionCalling"})`, which works, and which
  // does not enforce the schema's limits: zod still parses the result, and the repair node still earns its place.
  //
  // Interim policy (2026-11-15), until a cheaper hosted model has been benchmarked as the test tier: the weapon specs on the fake
  // and local tiers draw with a canned valid drawing. A real local drawing takes about 30 seconds, which would take the whole local
  // weapon run from about 85 seconds to well over half an hour, and its drawings were judged poor. The wiring, the call budget and
  // the path are still proved; `DrawingAWeapon` tests the real local model's drawings by itself, and the paid tier draws for real.
  protected createModels(): WeaponPipelineDependencies {
    return {
      generator: createLocalChatModel({temperature: 0, numPredict: 400}),
      moderator: createLocalChatModel({temperature: 0, numPredict: 100}),
      appearanceGenerator: fakeAppearanceGenerator(),
    };
  }
}
