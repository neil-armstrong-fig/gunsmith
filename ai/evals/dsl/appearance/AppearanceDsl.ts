import {AppearancePipeline} from "@evals/dsl/appearance/pipeline/AppearancePipeline";
import type {AppearanceDriver} from "@evals/dsl/appearance/types/AppearanceDriver";
import {DslError} from "@evals/dsl/errors/DslError";
import type {StandingCriterion} from "@evals/dsl/types/StandingCriterion";

// The most model calls any request may cost: the drawing and at most one repair.
const MAXIMUM_MODEL_CALLS = 2;

/**
 * What a weapon looks like, as a test sees it: ask for a drawing, then say what must be true of the answer. A component of
 * `WeaponSmithDsl`, as `arena` is of `GunsmithDsl`. Every method only wraps the pipeline beneath it in a `try` / `catch` and
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

  /** The model's own drawing is shown, first time or after the one repair, and not the plain stand-in. */
  expectDrawnByTheModel(): void {
    try {
      this.pipeline.checkDrawnByTheModel();
    } catch (error) {
      throw new DslError("Expected the model's own drawing to be shown", error);
    }
  }

  /** The model's first drawing was accepted (as written, or once the code had finished it), so no repair was asked. */
  expectNoRepairNeeded(): void {
    try {
      this.pipeline.checkNoRepairNeeded();
    } catch (error) {
      throw new DslError("Expected the first drawing to need no repair", error);
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
        description: "whatever is asked, what the player sees is safe to show",
        expect: () => this.expectSafeToShow(),
      },
      {
        description: "whatever is asked, a stand-in is never passed off as the model's own drawing",
        expect: () => this.expectStandInDisclosed(),
      },
      {
        description: "whatever is asked, the pipeline keeps to its fixed path, within two model calls",
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
