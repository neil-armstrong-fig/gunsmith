import {AppearancePipeline} from "@evals/dsl/appearance/pipeline/AppearancePipeline";
import type {AppearanceDriver} from "@evals/dsl/appearance/types/AppearanceDriver";
import type {RepairAllowance} from "@evals/dsl/shared/types/RepairAllowance";
import {DslError} from "@evals/dsl/shared/errors/DslError";
import type {StandingCriterion} from "@evals/dsl/shared/types/StandingCriterion";

// The most model calls any request may cost: the drawing and at most one repair.
const MAXIMUM_MODEL_CALLS = 2;

/**
 * What a weapon looks like, as a test sees it: ask for a drawing, then say what must be true of the answer. A component of
 * `WeaponDsl`, as `arena` is of `GunsmithDsl`. Every method only wraps the pipeline beneath it in a `try` / `catch` and
 * rethrows a `DslError` that says what was attempted, so a failed criterion reads as one sentence. `AppearancePipeline` does the
 * work. An `expect` changes nothing, so the `then`s of one `when` can share one `ask`.
 */
export class AppearanceDsl {
  private readonly pipeline: AppearancePipeline;

  constructor(driver: AppearanceDriver) {
    this.pipeline = new AppearancePipeline(driver);
  }

  /** Puts a player's request through the appearance pipeline, once for every trial, replacing the answers of any earlier request. */
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
  expectStandInDisclosed(): void {
    try {
      this.pipeline.checkStandInDisclosed();
    } catch (error) {
      throw new DslError("Expected a stand-in drawing to be disclosed", error);
    }
  }

  /**
   * What holds whatever was asked, so a test does not repeat it: what is shown is safe, a stand-in is never passed off as the
   * model's own, and the pipeline keeps to its fixed path within its two model calls. The mapping reports each under every
   * appearance `when`.
   */
  standingCriteria(): StandingCriterion[] {
    return [
      {
        description:
          "whatever is asked, the drawing shown is valid and inside the canvas, and draws something readable",
        expect: () => this.expectSafeToShow(),
      },
      {
        description:
          "whatever is asked, the plain stand-in is shown exactly when the ending says so, never passed off as the model's own drawing",
        expect: () => this.expectStandInDisclosed(),
      },
      {
        description:
          "whatever is asked, the pipeline follows the fixed route its ending requires and spends at most two model calls",
        expect: () => this.expectFixedPathWithinModelCalls(MAXIMUM_MODEL_CALLS),
      },
    ];
  }

  private expectFixedPathWithinModelCalls(maximumModelCalls: number): void {
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
