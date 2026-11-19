import {DslError} from "@evals/dsl/shared/errors/DslError";
import type {TrialDsl} from "@evals/dsl/shared/types/TrialDsl";
import type {ArenaPipelineDriver} from "@evals/dsl/arena/types/ArenaPipelineDriver";
import {ArenaPipeline} from "@evals/dsl/arena/pipeline/ArenaPipeline";

/**
 * The arena pipeline as a test sees it: ask it for an arena, then say what must be true of its answer. Every method only wraps
 * the pipeline beneath it in a `try` / `catch` and rethrows a `DslError` that says what was attempted, so a failed criterion reads
 * as one sentence. `ArenaPipeline` does the work. An `expect` changes nothing, so the `then`s of one `when` can share one `ask`.
 */
export class ArenaDsl implements TrialDsl<ArenaDsl> {
  readonly domain = "arena";
  private readonly pipeline: ArenaPipeline;

  constructor(private readonly driver: ArenaPipelineDriver) {
    this.pipeline = new ArenaPipeline(driver);
  }

  /** How many times a request is run, which a spec reads to give each trial its own scope. */
  get trials(): number {
    return this.driver.trials;
  }

  /** A DSL for one trial: it asks once, on this DSL's driver, and holds only that trial's answer. */
  forTrial(): ArenaDsl {
    return new ArenaDsl({trials: 1, run: prompt => this.driver.run(prompt)});
  }

  /** Puts a player's request through the pipeline replacing the answer of any earlier request. */
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

  /** The model's own arena was created, and the low cover blocks the request asked for are still in its drawing. */
  expectCoverKept(): void {
    try {
      this.pipeline.checkKeepsCover();
    } catch (error) {
      throw new DslError("Expected the model's own arena to be created with cover blocks", error);
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
