import {DslError} from "@evals/dsl/errors/DslError";
import type {StandingCriterion} from "@evals/dsl/types/StandingCriterion";
import type {ArenaPipelineDriver} from "@evals/dsl/arena/types/ArenaPipelineDriver";
import {ArenaPipeline} from "@evals/dsl/arena/pipeline/ArenaPipeline";

// The most model calls any arena request may cost: moderation, generation and at most one repair (two when nothing needs repairing).
const MAXIMUM_MODEL_CALLS = 3;

/**
 * The arena pipeline as a test sees it: ask it for an arena, then say what must be true of its answer. Every method only wraps
 * the pipeline beneath it in a `try` / `catch` and rethrows a `DslError` that says what was attempted, so a failed criterion reads
 * as one sentence. `ArenaPipeline` does the work. An `expect` changes nothing, so the `then`s of one `when` can share one `ask`.
 */
export class ArenaDsl {
  private readonly pipeline: ArenaPipeline;

  constructor(driver: ArenaPipelineDriver) {
    this.pipeline = new ArenaPipeline(driver);
  }

  /** Puts a player's request through the pipeline, once for every trial, replacing the answers of any earlier request. */
  async ask(prompt: string): Promise<void> {
    try {
      await this.pipeline.ask(prompt);
    } catch (error) {
      throw new DslError(`Failed to ask the arena pipeline for "${prompt}"`, error);
    }
  }

  /** An arena was created, the model's own and playable. */
  expectCreated(): void {
    try {
      this.pipeline.checkCreated();
    } catch (error) {
      throw new DslError("Expected an arena to be created", error);
    }
  }

  /** An arena was given to play, the model's own or a built-in one: a request asked for properly never ends with nothing. */
  expectArenaGiven(): void {
    try {
      this.pipeline.checkArenaGiven();
    } catch (error) {
      throw new DslError("Expected an arena to be given", error);
    }
  }

  /** The model's arena could not be used, even after one repair, so a built-in arena was given. */
  expectBuiltInGiven(): void {
    try {
      this.pipeline.checkBuiltInGiven();
    } catch (error) {
      throw new DslError("Expected a built-in arena to be given", error);
    }
  }

  /** The request was turned away: not an arena request, or too long. */
  expectRejected(): void {
    try {
      this.pipeline.checkRejected();
    } catch (error) {
      throw new DslError("Expected the request to be rejected", error);
    }
  }

  /** The request cost no more than this many model calls: none for unusable input, one for an off-topic question. */
  expectModelCallsAtMost(maximumModelCalls: number): void {
    try {
      this.pipeline.checkModelCallsAtMost(maximumModelCalls);
    } catch (error) {
      throw new DslError(`Expected at most ${maximumModelCalls} model calls`, error);
    }
  }

  /** What the player is shown can be played, and carries no leaked prompt. */
  expectSafeToShow(): void {
    try {
      this.pipeline.checkSafeToShow();
    } catch (error) {
      throw new DslError("Expected what the player sees to be safe to show", error);
    }
  }

  /** The credit goes back exactly when a built-in arena was given instead of the arena asked for. */
  expectRefundedOnlyForBuiltIn(): void {
    try {
      this.pipeline.checkRefundedOnlyForBuiltIn();
    } catch (error) {
      throw new DslError("Expected the credit to be refunded only when a built-in arena was given", error);
    }
  }

  /**
   * What holds whatever was asked, so a test does not repeat it: nothing unsafe is shown, the pipeline keeps to its fixed path
   * within its three model calls, and the credit goes back exactly when a built-in arena is given. The mapping reports each under
   * every `when`.
   */
  standingCriteria(): StandingCriterion[] {
    return [
      {
        description: "whatever is asked, what the player sees is safe to show",
        expect: () => this.expectSafeToShow(),
      },
      {
        description: "whatever is asked, the pipeline keeps to its fixed path, within three model calls",
        expect: () => this.expectFixedPathWithinModelCalls(MAXIMUM_MODEL_CALLS),
      },
      {
        description: "whatever is asked, the credit is refunded only when a built-in arena is given",
        expect: () => this.expectRefundedOnlyForBuiltIn(),
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
