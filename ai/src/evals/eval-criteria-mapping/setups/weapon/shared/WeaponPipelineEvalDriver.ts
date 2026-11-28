import type {WeaponPipelineDriver} from "@evals/dsl/weapon/types/WeaponPipelineDriver";
import {trialCount} from "@evals/eval-criteria-mapping/environment/tier/shared/trials/TrialCount";
import type {WeaponPipelineRun} from "@evals/eval-criteria-mapping/setups/weapon/shared/types/WeaponPipelineRun";
import {generateWeapon} from "@gunsmith/ai/pipeline/weapon/GenerateWeapon";
import type {WeaponOutcome} from "@gunsmith/ai/pipeline/weapon/types/WeaponOutcome";
import type {WeaponPipelineDependencies} from "@gunsmith/ai/pipeline/weapon/types/WeaponPipelineDependencies";

/**
 * What every tier's weapon driver does: put a request through the real weapon pipeline on the models its tier builds, as many times
 * as the tier (or `EVAL_TRIALS`) asks. A tier overrides `createModels`, and `runThrough` where it must wrap a request (the paid tier).
 */
export abstract class WeaponPipelineEvalDriver implements WeaponPipelineDriver {
  readonly trials: number;
  private models: WeaponPipelineDependencies | undefined;

  protected constructor(requestedTrials: string | undefined, defaultTrials: number) {
    this.trials = trialCount(requestedTrials, defaultTrials);
  }

  run(prompt: string): Promise<WeaponOutcome> {
    const dependencies = this.modelsOnFirstRequest();

    return this.runThrough(prompt, request => generateWeapon({prompt: request}, dependencies));
  }

  protected abstract createModels(): WeaponPipelineDependencies;

  /** What a request is put through. The models exist by now; the paid tier checks its spend around the pipeline here. */
  protected runThrough(prompt: string, pipeline: WeaponPipelineRun): Promise<WeaponOutcome> {
    return pipeline(prompt);
  }

  // Built on the first request, not in the constructor: the mapping builds every driver when a spec file loads, and the paid models
  // need a key, which a run that never asks for a weapon must not need.
  private modelsOnFirstRequest(): WeaponPipelineDependencies {
    this.models ??= this.createModels();

    return this.models;
  }
}
