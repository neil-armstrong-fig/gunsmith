import {DslError} from "@evals/dsl/shared/errors/DslError";
import type {TrialDsl} from "@evals/dsl/shared/types/TrialDsl";
import type {ArenaSubmissionDriver} from "@evals/dsl/arena-submission/types/ArenaSubmissionDriver";
import type {PromptAndBuiltInSubmissions} from "@evals/dsl/arena-submission/types/PromptAndBuiltInSubmissions";
import type {PromptSubmissions} from "@evals/dsl/arena-submission/types/PromptSubmissions";
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

  /** The one submission that passed goes forward by default, and it is this prompt. */
  expectOnlySubmissionForwarded(prompt: string): void {
    try {
      this.pipeline.checkOnlySubmissionForwarded(prompt);
    } catch (error) {
      throw new DslError(`Expected "${prompt}" to go forward by default, as the only submission`, error);
    }
  }

  /**
   * No arena a player put forward survived screening, so there is nothing to generate and the caller uses a built-in arena. This
   * reads only what screening left (the arenas put forward, not yet generated); nothing here generates an arena.
   */
  expectNoSurvivingArenas(): void {
    try {
      this.pipeline.checkNoSurvivingArenas();
    } catch (error) {
      throw new DslError("Expected no arena to survive screening", error);
    }
  }

  /** Two submissions passed, so both are generated and the players pick between them. */
  expectPlayersPick(): void {
    try {
      this.pipeline.checkPlayersPick();
    } catch (error) {
      throw new DslError("Expected two submissions to be left for the players to pick between", error);
    }
  }

  /**
   * What holds whatever was asked, so a test does not repeat it: what goes forward is a submission that was made, word for word, and
   * what is left follows how many survived; screening costs a moderation call for each prompt at most and none for a built-in; and
   * nothing a player is shown carries a prompt or the system prompt's canary. The mapping reports each under every `when`.
   */

  expectSurvivorsAreSubmissions(): void {
    try {
      this.pipeline.checkSurvivorsAreSubmissions();
    } catch (error) {
      throw new DslError("Expected what goes forward to be a submission that was made", error);
    }
  }

  expectWithinModelCalls(): void {
    try {
      this.pipeline.checkWithinModelCalls();
    } catch (error) {
      throw new DslError("Expected screening to cost at most one model call for each prompt", error);
    }
  }

  expectSafeToShow(): void {
    try {
      this.pipeline.checkSafeToShow();
    } catch (error) {
      throw new DslError("Expected what the players see to be safe to show", error);
    }
  }
}
