import type {ArenaPipelineDriver} from "@evals/dsl/arena/types/ArenaPipelineDriver";
import type {ArenaEvaluator} from "@evals/dsl/arena/pipeline/types/ArenaEvaluator";
import {arenaGiven} from "@evals/dsl/arena/pipeline/evaluators/outcome/ArenaGiven";
import {arenaKeepsCover} from "@evals/dsl/arena/pipeline/evaluators/outcome/ArenaKeepsCover";
import {arenaModelCallBudget} from "@evals/dsl/arena/pipeline/evaluators/outcome/ArenaModelCallBudget";
import {arenaNodePath} from "@evals/dsl/arena/pipeline/evaluators/outcome/ArenaNodePath";
import {arenaOutcomeMatches} from "@evals/dsl/arena/pipeline/evaluators/outcome/ArenaOutcomeMatches";
import {builtInRefunded} from "@evals/dsl/arena/pipeline/evaluators/outcome/BuiltInRefunded";
import {playableArena} from "@evals/dsl/arena/pipeline/evaluators/playable/PlayableArena";
import {arenaNoPromptLeak} from "@evals/dsl/arena/pipeline/evaluators/player-visible/ArenaNoPromptLeak";
import {failuresOf} from "@evals/dsl/shared/checks/FailuresOf";
import type {ArenaOutcome} from "@gunsmith/ai/pipeline/arena/types/ArenaOutcome";

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

  checkCreated(): void {
    this.checkAnswer([input => arenaOutcomeMatches(input, "created")]);
  }

  checkArenaGiven(): void {
    this.checkAnswer([arenaGiven]);
  }

  checkKeepsCover(): void {
    this.checkAnswer([input => arenaOutcomeMatches(input, "created"), arenaKeepsCover]);
  }

  checkBuiltInGiven(): void {
    this.checkAnswer([input => arenaOutcomeMatches(input, "builtIn")]);
  }

  checkRejected(): void {
    this.checkAnswer([input => arenaOutcomeMatches(input, "rejected")]);
  }

  checkSafeToShow(): void {
    this.checkAnswer([playableArena, arenaNoPromptLeak]);
  }

  checkFixedPathWithin(maximumModelCalls: number): void {
    this.checkAnswer([arenaNodePath, input => arenaModelCallBudget(input, maximumModelCalls)]);
  }

  checkModelCallsAtMost(maximumModelCalls: number): void {
    this.checkAnswer([input => arenaModelCallBudget(input, maximumModelCalls)]);
  }

  checkRefundedOnlyForBuiltIn(): void {
    this.checkAnswer([builtInRefunded]);
  }

  private checkAnswer(checks: ArenaEvaluator[]): void {
    if (!this.answered) {
      throw new Error("Ask for an arena (in a beforeAll) before expecting anything");
    }

    const failures = failuresOf({outcome: this.answered}, checks);
    if (failures.length > 0) {
      throw new Error(failures.join("; "));
    }
  }
}
