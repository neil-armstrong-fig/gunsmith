import {DslError} from "@evals/dsl/errors/DslError";
import type {StandingCriterion} from "@evals/dsl/types/StandingCriterion";
import type {ArenaSubmissionDriver} from "@evals/dsl/arena-submission/types/ArenaSubmissionDriver";
import {ArenaSubmissionPipeline} from "@evals/dsl/arena-submission/pipeline/ArenaSubmissionPipeline";

/**
 * The arena submissions as a test sees them: give screening the arenas two players put forward, then say what must be true of what is
 * left for them. The players pick the arena, not a model, so nothing here judges which is better. Every method only wraps the
 * pipeline beneath it in a `try` / `catch` and rethrows a `DslError` that says what was attempted, so a failed criterion reads as one
 * sentence. `ArenaSubmissionPipeline` does the work. An `expect` changes nothing, so the `then`s of one `when` can share one `ask`.
 */
export class ArenaSubmissionDsl {
  private readonly pipeline: ArenaSubmissionPipeline;

  constructor(driver: ArenaSubmissionDriver) {
    this.pipeline = new ArenaSubmissionPipeline(driver);
  }

  /** Puts none, one or two arena prompts (the first from "first", the second from "second") through screening. */
  async askWithPrompts(...prompts: string[]): Promise<void> {
    try {
      await this.pipeline.askWithPrompts(prompts);
    } catch (error) {
      throw new DslError(`Failed to screen ${prompts.length} arena prompt(s)`, error);
    }
  }

  /** Puts an arena prompt and a built-in arena, named, through screening. */
  async askWithPromptAndBuiltIn(prompt: string, builtInName: string): Promise<void> {
    try {
      await this.pipeline.askWithPromptAndBuiltIn(prompt, builtInName);
    } catch (error) {
      throw new DslError(`Failed to screen "${prompt}" and the built-in arena "${builtInName}"`, error);
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

  /** Nothing passed, so a built-in arena is used. */
  expectNothingLeft(): void {
    try {
      this.pipeline.checkNothingLeft();
    } catch (error) {
      throw new DslError("Expected no submission to be left for the players", error);
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
  standingCriteria(): StandingCriterion[] {
    return [
      {
        description:
          "whatever is asked, what goes forward is a submission that was made, and what is left follows how many survived",
        expect: () => this.expectSurvivorsAreSubmissions(),
      },
      {
        description:
          "whatever is asked, screening costs at most one model call for each prompt, none for a built-in arena",
        expect: () => this.expectWithinModelCalls(),
      },
      {
        description: "whatever is asked, what the players are shown repeats no prompt and leaks nothing",
        expect: () => this.expectSafeToShow(),
      },
    ];
  }

  private expectSurvivorsAreSubmissions(): void {
    try {
      this.pipeline.checkSurvivorsAreSubmissions();
    } catch (error) {
      throw new DslError("Expected what goes forward to be a submission that was made", error);
    }
  }

  private expectWithinModelCalls(): void {
    try {
      this.pipeline.checkWithinModelCalls();
    } catch (error) {
      throw new DslError("Expected screening to cost at most one model call for each prompt", error);
    }
  }

  private expectSafeToShow(): void {
    try {
      this.pipeline.checkSafeToShow();
    } catch (error) {
      throw new DslError("Expected what the players see to be safe to show", error);
    }
  }
}
