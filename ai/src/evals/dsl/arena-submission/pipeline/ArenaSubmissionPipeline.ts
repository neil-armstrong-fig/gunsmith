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
import {failuresAcrossTrials} from "@evals/dsl/shared/trials/FailuresAcrossTrials";
import type {ArenaSubmission} from "@gunsmith/ai/pipeline/arena-submission/types/ArenaSubmission";

const FIRST_PLAYER = "first";
const SECOND_PLAYER = "second";

/**
 * Arena-submission screening as seen from outside, the system under test: the one class that knows how to put submissions through it
 * and how to read what came back, as `ArenaPipeline` is for one arena. `ask…` runs the submissions once for every trial (a model's
 * answer varies) and holds the answers; each `check…` runs pure evaluators over them and holds only if it held in every trial
 * (pass^k), throwing one sentence for each check that failed. It catches nothing and wraps nothing: the DSL says what was attempted.
 */
export class ArenaSubmissionPipeline {
  private readonly driver: ArenaSubmissionDriver;
  private answered: ArenaSubmissionEvalInput[] = [];

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
    this.checkEveryTrial([input => statusMatches(input, "only-submission"), input => survivorIs(input, prompt)]);
  }

  checkNoSurvivingArenas(): void {
    this.checkEveryTrial([input => statusMatches(input, "none")]);
  }

  checkPlayersPick(): void {
    this.checkEveryTrial([input => statusMatches(input, "players-pick")]);
  }

  checkSurvivorsAreSubmissions(): void {
    this.checkEveryTrial([survivorsWereSubmitted, statusFollowsSurvivors]);
  }

  checkWithinModelCalls(): void {
    this.checkEveryTrial([screeningModelCallBudget]);
  }

  checkSafeToShow(): void {
    this.checkEveryTrial([rejectionReasonsEchoNoPrompt, screeningNoCanaryLeak]);
  }

  private async ask(submissions: readonly ArenaSubmission[]): Promise<void> {
    const answered: ArenaSubmissionEvalInput[] = [];

    for (let trial = 0; trial < this.driver.trials; trial += 1) {
      answered.push({submissions, screening: await this.driver.run(submissions)});
    }

    this.answered = answered;
  }

  private checkEveryTrial(checks: ArenaSubmissionEvaluator[]): void {
    if (this.answered.length === 0) {
      throw new Error("Ask for arena submissions to be screened (in a beforeAll) before expecting anything");
    }

    const failures = checks.flatMap(check => failuresAcrossTrials(this.answered, check));
    if (failures.length > 0) {
      throw new Error(failures.join("; "));
    }
  }
}
