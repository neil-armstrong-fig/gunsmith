import type {ArenaSubmissionDriver} from "@evals/dsl/arena-submission/types/ArenaSubmissionDriver";
import type {PromptAndBuiltInSubmissions} from "@evals/dsl/arena-submission/types/PromptAndBuiltInSubmissions";
import type {PromptSubmissions} from "@evals/dsl/arena-submission/types/PromptSubmissions";
import type {ArenaSubmissionEvalInput} from "@evals/dsl/arena-submission/pipeline/types/ArenaSubmissionEvalInput";
import type {ArenaSubmissionEvaluator} from "@evals/dsl/arena-submission/pipeline/types/ArenaSubmissionEvaluator";
import {screeningModelCallBudget} from "@evals/dsl/arena-submission/pipeline/evaluators/cost/ScreeningModelCallBudget";
import {rejectionReasonsEchoNoPrompt} from "@evals/dsl/arena-submission/pipeline/evaluators/player-visible/RejectionReasonsEchoNoPrompt";
import {screeningNoCanaryLeak} from "@evals/dsl/arena-submission/pipeline/evaluators/player-visible/ScreeningNoCanaryLeak";
import {statusFollowsSurvivors} from "@evals/dsl/arena-submission/pipeline/evaluators/survivors/StatusFollowsSurvivors";
import {statusMatches} from "@evals/dsl/arena-submission/pipeline/evaluators/survivors/StatusMatches";
import {survivorIs} from "@evals/dsl/arena-submission/pipeline/evaluators/survivors/SurvivorIs";
import {survivorsWereSubmitted} from "@evals/dsl/arena-submission/pipeline/evaluators/survivors/SurvivorsWereSubmitted";
import {failuresOf} from "@evals/dsl/shared/checks/FailuresOf";
import type {ArenaSubmission} from "@gunsmith/ai/pipeline/arena-submission/types/ArenaSubmission";

const FIRST_PLAYER = "first";
const SECOND_PLAYER = "second";

/**
 * Arena-submission screening as seen from outside, the system under test: the one class that knows how to put submissions through it
 * and how to read what came back, as `ArenaPipeline` is for one arena. `ask…` runs the submissions once and holds the answer; each
 * `check…` runs pure evaluators over it, throwing one sentence for each check that failed (each trial is a scope of its own, so pass^k is the mapping's). It catches nothing and wraps nothing: the DSL says what was attempted.
 */
export class ArenaSubmissionPipeline {
  private readonly driver: ArenaSubmissionDriver;
  private answered: ArenaSubmissionEvalInput | undefined;

  constructor(driver: ArenaSubmissionDriver) {
    this.driver = driver;
  }

  /** Puts player 1's prompt (from "first"), player 2's (from "second"), both or neither through screening, replacing any earlier answers. */
  async askWithPrompts({player1, player2}: PromptSubmissions): Promise<void> {
    const submissions: ArenaSubmission[] = [];

    if (player1 !== undefined) {
      submissions.push({kind: "prompt", playerId: FIRST_PLAYER, prompt: player1});
    }

    if (player2 !== undefined) {
      submissions.push({kind: "prompt", playerId: SECOND_PLAYER, prompt: player2});
    }

    await this.ask(submissions);
  }

  /** Puts player 1's prompt (from "first") and player 2's built-in arena, named (from "second"), through screening, replacing any earlier answers. */
  async askWithPromptAndBuiltIn({player1, player2}: PromptAndBuiltInSubmissions): Promise<void> {
    await this.ask([
      {kind: "prompt", playerId: FIRST_PLAYER, prompt: player1},
      {kind: "built-in", playerId: SECOND_PLAYER, builtInName: player2},
    ]);
  }

  /** Puts one built-in arena, named, from "first" through screening, replacing any earlier answers. */
  async askWithBuiltIn(builtInName: string): Promise<void> {
    await this.ask([{kind: "built-in", playerId: FIRST_PLAYER, builtInName}]);
  }

  checkOnlySubmissionForwarded(prompt: string): void {
    this.checkAnswer([input => statusMatches(input, "only-submission"), input => survivorIs(input, prompt)]);
  }

  checkNoSurvivingArenas(): void {
    this.checkAnswer([input => statusMatches(input, "none")]);
  }

  checkPlayersPick(): void {
    this.checkAnswer([input => statusMatches(input, "players-pick")]);
  }

  checkSurvivorsAreSubmissions(): void {
    this.checkAnswer([survivorsWereSubmitted, statusFollowsSurvivors]);
  }

  checkWithinModelCalls(): void {
    this.checkAnswer([screeningModelCallBudget]);
  }

  checkSafeToShow(): void {
    this.checkAnswer([rejectionReasonsEchoNoPrompt, screeningNoCanaryLeak]);
  }

  private async ask(submissions: readonly ArenaSubmission[]): Promise<void> {
    this.answered = {submissions, screening: await this.driver.run(submissions)};
  }

  private checkAnswer(checks: ArenaSubmissionEvaluator[]): void {
    if (!this.answered) {
      throw new Error("Ask for arena submissions to be screened (in a beforeAll) before expecting anything");
    }

    const failures = failuresOf(this.answered, checks);
    if (failures.length > 0) {
      throw new Error(failures.join("; "));
    }
  }
}
