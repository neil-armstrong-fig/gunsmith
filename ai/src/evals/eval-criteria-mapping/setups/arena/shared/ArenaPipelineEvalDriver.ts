import {generateArena} from "@gunsmith/ai/pipeline/arena/GenerateArena";
import type {ArenaOutcome} from "@gunsmith/ai/pipeline/arena/types/ArenaOutcome";
import type {ArenaPipelineDependencies} from "@gunsmith/ai/pipeline/arena/types/ArenaPipelineDependencies";
import type {ArenaPipelineDriver} from "@evals/dsl/arena/types/ArenaPipelineDriver";
import {keepsGenerated} from "@evals/eval-criteria-mapping/environment/reporting/keeps-generated/KeepsGenerated";
import {trialCount} from "@evals/eval-criteria-mapping/environment/tier/shared/trials/TrialCount";
import type {TierDriverSettings} from "@evals/eval-criteria-mapping/environment/tier/shared/types/TierDriverSettings";
import {keepArena} from "@evals/eval-criteria-mapping/setups/arena/shared/arenas/KeepArena";
import {startArenas} from "@evals/eval-criteria-mapping/setups/arena/shared/arenas/StartArenas";
import type {ArenaKeeping} from "@evals/eval-criteria-mapping/setups/arena/shared/arenas/types/ArenaKeeping";

const RESULTS_FOLDER = "src/evals/results";

/**
 * What every tier's arena driver does: put a request through the real arena pipeline on the models its tier builds, and keep every
 * arena its model drew on a page to look at when the run keeps them. A tier overrides `createModels`.
 */
export abstract class ArenaPipelineEvalDriver implements ArenaPipelineDriver {
  readonly trials: number;
  /** Whether this run keeps every arena on a page: by default for the tier, and `EVAL_KEEP_ARENAS` (`1` or `0`) overrides. */
  readonly keepsArenas: boolean;
  private readonly keeping: ArenaKeeping;
  private models: ArenaPipelineDependencies | undefined;
  private started = false;

  protected constructor(settings: TierDriverSettings) {
    this.trials = trialCount(settings.requestedTrials, settings.defaultTrials);
    this.keepsArenas = keepsGenerated(process.env.EVAL_KEEP_ARENAS, settings.keepsGeneratedByDefault);
    this.keeping = {folder: RESULTS_FOLDER, tier: settings.tier, enabled: this.keepsArenas};
  }

  run(prompt: string): Promise<ArenaOutcome> {
    const dependencies = this.modelsOnFirstRequest();
    this.startArenasOnFirstRequest();

    return generateArena({prompt}, dependencies).then(outcome => {
      keepArena({...this.keeping, arena: {prompt, outcome}});

      return outcome;
    });
  }

  protected abstract createModels(): ArenaPipelineDependencies;

  // Built on the first request, not in the constructor: the mapping builds every driver when a spec file loads, and a tier without a
  // model (the paid one, for now) must not fail a run that never asks for an arena.
  private modelsOnFirstRequest(): ArenaPipelineDependencies {
    this.models ??= this.createModels();

    return this.models;
  }

  // Started at the first request, not when the driver is built: every spec file builds this driver, and one that never asks for an
  // arena must not empty the arenas an earlier spec just kept (and the run's id keeps a later spec file from doing it either).
  private startArenasOnFirstRequest(): void {
    if (this.started) {
      return;
    }

    startArenas({...this.keeping, runId: process.env.EVAL_RUN_ID});
    this.started = true;
  }
}
