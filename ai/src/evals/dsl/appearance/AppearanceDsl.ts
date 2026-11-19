import {AppearancePipeline} from "@evals/dsl/appearance/pipeline/AppearancePipeline";
import type {AppearanceDriver} from "@evals/dsl/appearance/types/AppearanceDriver";
import {DslError} from "@evals/dsl/shared/errors/DslError";
import type {AppearanceOutcomeStatus} from "@gunsmith/ai/pipeline/appearance/types/AppearanceOutcomeStatus";
import type {TrialDsl} from "@evals/dsl/shared/types/TrialDsl";

/**
 * What a weapon looks like, as a test sees it: ask for a drawing, then say what must be true of the answer. A component of
 * `WeaponDsl`, as `arena` is of `GunsmithDsl`. Every method only wraps the pipeline beneath it in a `try` / `catch` and
 * rethrows a `DslError` that says what was attempted, so a failed criterion reads as one sentence. `AppearancePipeline` does the
 * work. An `expect` changes nothing, so the `then`s of one `when` can share one `ask`.
 */
export class AppearanceDsl implements TrialDsl<AppearanceDsl> {
  readonly domain = "appearance";
  private readonly pipeline: AppearancePipeline;

  constructor(private readonly driver: AppearanceDriver) {
    this.pipeline = new AppearancePipeline(driver);
  }

  /** How many times a request is run, which a spec reads to give each trial its own scope. */
  get trials(): number {
    return this.driver.trials;
  }

  /** A DSL for one trial: it asks once, on this DSL's driver, and holds only that trial's answer. */
  forTrial(): AppearanceDsl {
    return new AppearanceDsl({trials: 1, run: prompt => this.driver.run(prompt)});
  }

  /** Puts a player's request through the appearance pipeline replacing the answer of any earlier request. */
  async ask(prompt: string): Promise<void> {
    try {
      await this.pipeline.ask(prompt);
    } catch (error) {
      throw new DslError(`Failed to ask for the appearance of "${prompt}"`, error);
    }
  }

  /** How the drawing ended: valid, completed, repaired, or the plain stand-in. The reading of one trial, so the spec states what it expects. */
  getStatus(): AppearanceOutcomeStatus {
    try {
      return this.pipeline.statusOfTheAnswer();
    } catch (error) {
      throw new DslError("Expected to read how the drawing ended", error);
    }
  }

  /** The steps the drawing ran, in order (`repair` is a repair the model was asked for). */
  getNodes(): string[] {
    try {
      return this.pipeline.nodesOfTheAnswer();
    } catch (error) {
      throw new DslError("Expected to read the nodes the drawing ran", error);
    }
  }

  /** How many model calls the drawing cost. The budget is the spec's to state. */
  getModelCalls(): number {
    try {
      return this.pipeline.modelCallsOfTheAnswer();
    } catch (error) {
      throw new DslError("Expected to read how many model calls the drawing cost", error);
    }
  }

  /** How many tokens the model wrote for the drawing, repair included, as it reported them. */
  getOutputTokens(): number {
    try {
      return this.pipeline.outputTokensOfTheAnswer();
    } catch (error) {
      throw new DslError("Expected to read the output tokens the drawing cost", error);
    }
  }

  /** What makes the drawing shown unsafe, if anything: a drawing that breaks a rule, runs outside the canvas, or draws nothing readable. */
  getSafeToShowProblems(): string[] {
    try {
      return this.pipeline.safeToShowProblems();
    } catch (error) {
      throw new DslError("Expected to read the problems with what the player sees", error);
    }
  }

  /** Where the plain stand-in is shown when the outcome does not say so, or is passed off as the model's own drawing, if it is. */
  getStandInProblems(): string[] {
    try {
      return this.pipeline.standInProblems();
    } catch (error) {
      throw new DslError("Expected to read the problems with the stand-in disclosure", error);
    }
  }

  /** Where the pipeline left the fixed route its ending requires, if it did: a repair only after a refused drawing, the stand-in only after a failed repair. */
  getFixedPathProblems(): string[] {
    try {
      return this.pipeline.fixedPathProblems();
    } catch (error) {
      throw new DslError("Expected to read the problems with the pipeline's path", error);
    }
  }
}
