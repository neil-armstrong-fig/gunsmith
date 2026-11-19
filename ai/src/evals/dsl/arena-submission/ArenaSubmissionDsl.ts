import {DslError} from "@evals/dsl/shared/errors/DslError";
import type {TrialDsl} from "@evals/dsl/shared/types/TrialDsl";
import type {ArenaSubmissionDriver} from "@evals/dsl/arena-submission/types/ArenaSubmissionDriver";
import type {PromptAndBuiltInSubmissions} from "@evals/dsl/arena-submission/types/PromptAndBuiltInSubmissions";
import type {PromptSubmissions} from "@evals/dsl/arena-submission/types/PromptSubmissions";
import type {ArenaSubmissionStatus} from "@gunsmith/ai/pipeline/arena-submission/types/ArenaSubmissionStatus";
import {ArenaSubmissionPipeline} from "@evals/dsl/arena-submission/pipeline/ArenaSubmissionPipeline";

/**
 * The arena submissions as a test sees them: give screening the arenas two players put forward, then say what must be true of what is
 * left for them. The players pick the arena, not a model, so nothing here judges which is better. Every method only wraps the
 * pipeline beneath it in a `try` / `catch` and rethrows a `DslError` that says what was attempted, so a failed criterion reads as one
 * sentence. `ArenaSubmissionPipeline` does the work. An `expect` changes nothing, so the `then`s of one `when` can share one `ask`.
 */
export class ArenaSubmissionDsl implements TrialDsl<ArenaSubmissionDsl> {
  readonly domain = "arenaSubmission";
  private readonly pipeline: ArenaSubmissionPipeline;

  constructor(private readonly driver: ArenaSubmissionDriver) {
    this.pipeline = new ArenaSubmissionPipeline(driver);
  }

  /** How many times a request is run, which a spec reads to give each trial its own scope. */
  get trials(): number {
    return this.driver.trials;
  }

  /** A DSL for one trial: it asks once, on this DSL's driver, and holds only that trial's answer. */
  forTrial(): ArenaSubmissionDsl {
    return new ArenaSubmissionDsl({trials: 1, run: submissions => this.driver.run(submissions)});
  }

  /** Puts through screening the arena prompt of player 1, of player 2, of both or of neither. */
  async askWithPrompts(submissions: PromptSubmissions): Promise<void> {
    try {
      await this.pipeline.askWithPrompts(submissions);
    } catch (error) {
      throw new DslError(
        `Failed to screen the arena prompts of player 1 ("${submissions.player1 ?? "none"}") and player 2 ("${submissions.player2 ?? "none"}")`,
        error,
      );
    }
  }

  /** Puts through screening an arena prompt from player 1 and a built-in arena, named, from player 2. */
  async askWithPromptAndBuiltIn(submissions: PromptAndBuiltInSubmissions): Promise<void> {
    try {
      await this.pipeline.askWithPromptAndBuiltIn(submissions);
    } catch (error) {
      throw new DslError(
        `Failed to screen the prompt "${submissions.player1}" from player 1 and the built-in arena "${submissions.player2}" from player 2`,
        error,
      );
    }
  }

  /** Puts one built-in arena, named, through screening. */
  async askWithBuiltIn(builtInName: string): Promise<void> {
    try {
      await this.pipeline.askWithBuiltIn(builtInName);
    } catch (error) {
      throw new DslError(`Failed to screen the built-in arena "${builtInName}"`, error);
    }
  }

  /** What screening left for the players: nothing (a built-in arena is used), one submission forward by default, or two to pick between. */
  getStatus(): ArenaSubmissionStatus {
    try {
      return this.pipeline.statusOfTheAnswer();
    } catch (error) {
      throw new DslError("Expected to read what screening left for the players", error);
    }
  }

  /** The prompts that survived screening, word for word and in the order they arrived. A surviving built-in arena has no prompt, so it is not listed. */
  getSurvivingPrompts(): string[] {
    try {
      return this.pipeline.survivingPromptsOfTheAnswer();
    } catch (error) {
      throw new DslError("Expected to read the prompts that survived screening", error);
    }
  }

  /** How many model calls screening cost: one moderation for each prompt that passed the pre-check, none for a built-in arena. */
  getModelCalls(): number {
    try {
      return this.pipeline.modelCallsOfTheAnswer();
    } catch (error) {
      throw new DslError("Expected to read how many model calls screening cost", error);
    }
  }

  /** What is wrong with what goes forward, if anything: a survivor that was not a submission made, a repeat, or a status that does not follow how many survived (none, one by default, or two to pick between). */
  getSurvivorProblems(): string[] {
    try {
      return this.pipeline.survivorProblems();
    } catch (error) {
      throw new DslError("Expected to read the problems with what went forward", error);
    }
  }

  /** Where screening spent more than one moderation call for a prompt, or any call on a built-in arena, if it did. */
  getCallBudgetProblems(): string[] {
    try {
      return this.pipeline.callBudgetProblems();
    } catch (error) {
      throw new DslError("Expected to read the problems with the model calls screening cost", error);
    }
  }

  /** What makes what the players are shown unsafe, if anything: a rejection reason that repeats a whole prompt or built-in name, or a leaked system prompt. */
  getSafeToShowProblems(): string[] {
    try {
      return this.pipeline.safeToShowProblems();
    } catch (error) {
      throw new DslError("Expected to read the problems with what the players see", error);
    }
  }
}
