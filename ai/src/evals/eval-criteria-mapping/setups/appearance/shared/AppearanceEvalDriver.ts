import {generateAppearance} from "@gunsmith/ai/pipeline/appearance/GenerateAppearance";
import type {AppearanceDependencies} from "@gunsmith/ai/pipeline/appearance/types/AppearanceDependencies";
import type {AppearanceOutcome} from "@gunsmith/ai/pipeline/appearance/types/AppearanceOutcome";
import type {AppearanceDriver} from "@evals/dsl/appearance/types/AppearanceDriver";
import {keepsGenerated} from "@evals/eval-criteria-mapping/environment/reporting/keeps-generated/KeepsGenerated";
import {trialCount} from "@evals/eval-criteria-mapping/environment/tier/shared/trials/TrialCount";
import type {EvalTier} from "@evals/eval-criteria-mapping/environment/tier/shared/types/EvalTier";
import type {TierDriverSettings} from "@evals/eval-criteria-mapping/environment/tier/shared/types/TierDriverSettings";
import {keepDrawing} from "@evals/eval-criteria-mapping/setups/appearance/shared/drawings/KeepDrawing";
import {startDrawings} from "@evals/eval-criteria-mapping/setups/appearance/shared/drawings/StartDrawings";

const RESULTS_FOLDER = "src/evals/results";

/**
 * What every tier's appearance driver does: put a request through the real appearance pipeline on the models its tier builds, and
 * keep the drawing for a person to look at when the run keeps them. A tier overrides `createModels`, and the two hooks around a
 * request where it needs to (the paid tier checks its spend there).
 */
export abstract class AppearanceEvalDriver implements AppearanceDriver {
  readonly trials: number;
  /** Whether this run keeps every drawing on a page: by default for the tier, and `EVAL_KEEP_DRAWINGS` (`1` or `0`) overrides. */
  readonly keepsDrawings: boolean;
  private readonly tier: EvalTier;
  private models: AppearanceDependencies | undefined;
  private started = false;

  protected constructor(settings: TierDriverSettings) {
    this.tier = settings.tier;
    this.trials = trialCount(settings.requestedTrials, settings.defaultTrials);
    this.keepsDrawings = keepsGenerated(process.env.EVAL_KEEP_DRAWINGS, settings.keepsGeneratedByDefault);
  }

  async run(prompt: string): Promise<AppearanceOutcome> {
    const dependencies = this.modelsOnFirstRequest();
    this.startDrawingsOnFirstRequest();
    this.beforeRequest();

    const outcome = await generateAppearance({prompt}, dependencies);

    this.afterOutcome();
    keepDrawing({folder: RESULTS_FOLDER, tier: this.tier, enabled: this.keepsDrawings, drawing: {prompt, outcome}});

    return outcome;
  }

  protected abstract createModels(): AppearanceDependencies;

  /** Runs before each request. A tier that must stop a request before it is made does it here. */
  protected beforeRequest(): void {
    // Nothing to check before a request unless the tier says so.
  }

  /** Runs after each request and before its drawing is kept, so a tier can refuse a result it cannot stand behind. */
  protected afterOutcome(): void {
    // Nothing to check after a request unless the tier says so.
  }

  // Built on the first request, not in the constructor: the mapping builds every driver when a spec file loads, and the paid model
  // needs a key, which a run that never draws must not need.
  private modelsOnFirstRequest(): AppearanceDependencies {
    this.models ??= this.createModels();

    return this.models;
  }

  // Started at the first request, not when the driver is built: every spec file builds this driver, and one that never draws must
  // not empty the drawings an earlier spec just kept.
  private startDrawingsOnFirstRequest(): void {
    if (this.started) {
      return;
    }

    startDrawings({folder: RESULTS_FOLDER, tier: this.tier, enabled: this.keepsDrawings});
    this.started = true;
  }
}
