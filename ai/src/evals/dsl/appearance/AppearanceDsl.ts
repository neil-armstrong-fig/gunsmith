import {AppearancePipeline} from "@evals/dsl/appearance/pipeline/AppearancePipeline";
import type {AppearanceDriver} from "@evals/dsl/appearance/types/AppearanceDriver";
import type {RepairAllowance} from "@evals/dsl/shared/types/RepairAllowance";
import {DslError} from "@evals/dsl/shared/errors/DslError";
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

  /**
   * The model's own drawing is shown, not the plain stand-in, and the model was asked to repair it at most this many times. Zero
   * means the first drawing was accepted, as written or once the code had finished it; one is the pipeline's whole repair budget.
   */
  expectDrawnByTheModel({maximumRepairs}: RepairAllowance): void {
    try {
      this.pipeline.checkDrawnByTheModel(maximumRepairs);
    } catch (error) {
      throw new DslError(`Expected the model's own drawing to be shown after at most ${maximumRepairs} repairs`, error);
    }
  }

  /** The model wrote no more than this many tokens for the request, repair included. */
  expectOutputTokensAtMost(maximumOutputTokens: number): void {
    try {
      this.pipeline.checkOutputTokensAtMost(maximumOutputTokens);
    } catch (error) {
      throw new DslError(`Expected at most ${maximumOutputTokens} output tokens`, error);
    }
  }

  /** Whatever the player is shown is safe: a drawing that passes every rule, inside the canvas, and visibly drawn. */
  expectSafeToShow(): void {
    try {
      this.pipeline.checkSafeToShow();
    } catch (error) {
      throw new DslError("Expected what the player sees to be safe to show", error);
    }
  }

  /** The plain stand-in is shown exactly when the outcome says so: it is never passed off as the model's own. */
  expectNoDisguisedStandIn(): void {
    try {
      this.pipeline.checkNoDisguisedStandIn();
    } catch (error) {
      throw new DslError("Expected no stand-in drawing to be passed off as the model's own", error);
    }
  }

  expectFixedPathWithinModelCalls(maximumModelCalls: number): void {
    try {
      this.pipeline.checkFixedPathWithin(maximumModelCalls);
    } catch (error) {
      throw new DslError(
        `Expected the pipeline to keep to its fixed path within ${maximumModelCalls} model calls`,
        error,
      );
    }
  }
}
