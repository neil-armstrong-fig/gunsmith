import type {ArenaPipelineDriver} from "@evals/dsl/arena/types/ArenaPipelineDriver";
import type {ArenaEvaluator} from "@evals/dsl/arena/pipeline/types/ArenaEvaluator";
import {arenaGiven} from "@evals/dsl/arena/pipeline/evaluators/outcome/ArenaGiven";
import {arenaKeepsCover} from "@evals/dsl/arena/pipeline/evaluators/outcome/ArenaKeepsCover";
import {arenaNodePath} from "@evals/dsl/arena/pipeline/evaluators/outcome/ArenaNodePath";
import {playableArena} from "@evals/dsl/arena/pipeline/evaluators/playable/PlayableArena";
import {arenaNoPromptLeak} from "@evals/dsl/arena/pipeline/evaluators/player-visible/ArenaNoPromptLeak";
import {failuresOf} from "@evals/dsl/shared/checks/FailuresOf";
import type {ArenaOutcome} from "@gunsmith/ai/pipeline/arena/types/ArenaOutcome";
import type {ArenaOutcomeStatus} from "@gunsmith/ai/pipeline/arena/types/ArenaOutcomeStatus";

/**
 * The arena pipeline as seen from outside, the system under test: the one class that knows how to put a request through it and
 * how to read what came back, as `WeaponPipeline` is for weapons. `ask` runs the request once and holds the answer; each
 * `check…` runs pure evaluators over it, throwing one sentence per check that failed and why (a criterion holds only if it held in every
 * trial, and each trial is a scope of its own, so that is the mapping's). It catches nothing and wraps
 * nothing: the DSL says what was being attempted.
 */
export class ArenaPipeline {
  private readonly driver: ArenaPipelineDriver;
  private answered: ArenaOutcome | undefined;

  constructor(driver: ArenaPipelineDriver) {
    this.driver = driver;
  }

  /** Puts a player's request through the pipeline, replacing any earlier answer. */
  async ask(prompt: string): Promise<void> {
    this.answered = await this.driver.run(prompt);
  }

  /** How the request ended: an arena created, the request rejected, or a built-in arena given. */
  statusOfTheAnswer(): ArenaOutcomeStatus {
    return this.theAnswer().status;
  }

  /** The model calls the request cost, all stages together. */
  modelCallsOfTheAnswer(): number {
    return this.theAnswer().modelCalls;
  }

  /** Whether the credit went back. */
  refundOfTheAnswer(): boolean {
    return this.theAnswer().refunded;
  }

  arenaGivenProblems(): string[] {
    return this.problemsOf([arenaGiven]);
  }

  coverProblems(): string[] {
    return this.problemsOf([arenaKeepsCover]);
  }

  safeToShowProblems(): string[] {
    return this.problemsOf([playableArena, arenaNoPromptLeak]);
  }

  fixedPathProblems(): string[] {
    return this.problemsOf([arenaNodePath]);
  }

  private theAnswer(): ArenaOutcome {
    if (!this.answered) {
      throw new Error("Ask for an arena (in a beforeAll) before expecting anything");
    }

    return this.answered;
  }

  private problemsOf(checks: ArenaEvaluator[]): string[] {
    return failuresOf({outcome: this.theAnswer()}, checks);
  }
}
