import {DslError} from "@evals/dsl/shared/errors/DslError";
import type {TrialDsl} from "@evals/dsl/shared/types/TrialDsl";
import type {ArenaPipelineDriver} from "@evals/dsl/arena/types/ArenaPipelineDriver";
import {ArenaPipeline} from "@evals/dsl/arena/pipeline/ArenaPipeline";
import type {ArenaSize} from "@gunsmith/ai/pipeline/arena/arena-shapes/types/ArenaSize";
import type {ArenaOutcomeStatus} from "@gunsmith/ai/pipeline/arena/types/ArenaOutcomeStatus";

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

  /** How the request ended: an arena created, the request rejected, or no arena made and a reason given (invalid). The reading of one trial, so the spec states what it expects. */
  getStatus(): ArenaOutcomeStatus {
    try {
      return this.pipeline.statusOfTheAnswer();
    } catch (error) {
      throw new DslError("Expected to read the status of the request", error);
    }
  }

  /** How many model calls the request cost, all stages together. The budget is the spec's to state. */
  getModelCalls(): number {
    try {
      return this.pipeline.modelCallsOfTheAnswer();
    } catch (error) {
      throw new DslError("Expected to read how many model calls the request cost", error);
    }
  }

  /** Whether the credit went back to the player. */
  wasRefunded(): boolean {
    try {
      return this.pipeline.refundOfTheAnswer();
    } catch (error) {
      throw new DslError("Expected to read whether the credit was refunded", error);
    }
  }

  /** Why the request was not answered honestly, if it was not: a request asked for properly ends with the model's own arena, or with no arena and a reason the player can read, never with nothing and never with a substitute. */
  getArenaAnsweredProblems(): string[] {
    try {
      return this.pipeline.arenaAnsweredProblems();
    } catch (error) {
      throw new DslError("Expected to read whether the request was answered", error);
    }
  }

  /** Why the arena given has no low cover block (`c`) in its drawing, if it has none, read as the engine reads it. A spec also states the status when it needs the model's own arena. */
  getCoverProblems(): string[] {
    try {
      return this.pipeline.coverProblems();
    } catch (error) {
      throw new DslError("Expected to read the cover in the arena given", error);
    }
  }

  /** Why the arena given is a built-in arena drawn again (a copy of what the model was shown), if it is: the request asked for the model's own. */
  getOwnArenaProblems(): string[] {
    try {
      return this.pipeline.ownArenaProblems();
    } catch (error) {
      throw new DslError("Expected to read whether the arena given is the model's own", error);
    }
  }

  /** How many tiles wide and tall the arena given is, or nothing when none was given. The spec states the size it expects. */
  getSize(): ArenaSize | undefined {
    try {
      return this.pipeline.sizeOfTheAnswer();
    } catch (error) {
      throw new DslError("Expected to read the size of the arena given", error);
    }
  }

  /** The highest level of raised floor in the arena given (0 for low ground only), or nothing when none was given. The spec states the height it expects. */
  getHighestLevel(): number | undefined {
    try {
      return this.pipeline.highestLevelOfTheAnswer();
    } catch (error) {
      throw new DslError("Expected to read the highest level of the arena given", error);
    }
  }

  /** How many of the four corners of the arena given are walled in, or nothing when none was given. The spec states how many the shape asked for has. */
  getWalledCorners(): number | undefined {
    try {
      return this.pipeline.walledCornersOfTheAnswer();
    } catch (error) {
      throw new DslError("Expected to read the walled corners of the arena given", error);
    }
  }

  /** What makes what the player is shown unsafe, if anything: an arena the engine would not play, or a leaked prompt. */
  getSafeToShowProblems(): string[] {
    try {
      return this.pipeline.safeToShowProblems();
    } catch (error) {
      throw new DslError("Expected to read the problems with what the player sees", error);
    }
  }

  /** Where the pipeline left its fixed order, if it did: pre-check first, at most one repair, a built-in arena only after a failed one. */
  getFixedPathProblems(): string[] {
    try {
      return this.pipeline.fixedPathProblems();
    } catch (error) {
      throw new DslError("Expected to read the problems with the pipeline's path", error);
    }
  }
}
