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
import {failuresAcrossTrials} from "@evals/dsl/shared/trials/FailuresAcrossTrials";
import type {ArenaOutcome} from "@gunsmith/ai/pipeline/arena/types/ArenaOutcome";

/**
 * The arena pipeline as seen from outside, the system under test: the one class that knows how to put a request through it and
 * how to read what came back, as `WeaponPipeline` is for weapons. `ask` runs the request once for every trial (a model's
 * answer varies) and holds the answers; each `check…` runs pure evaluators over them and holds only if it held in every trial
 * (pass^k), throwing one sentence per check that failed with the trials it failed in and why. It catches nothing and wraps
 * nothing: the DSL says what was being attempted.
 */
export class ArenaPipeline {
  private readonly driver: ArenaPipelineDriver;
  private answered: ArenaOutcome[] = [];

  constructor(driver: ArenaPipelineDriver) {
    this.driver = driver;
  }

  /** Puts a player's request through the pipeline, once for every trial, replacing any earlier answers. */
  async ask(prompt: string): Promise<void> {
    const outcomes: ArenaOutcome[] = [];

    for (let trial = 0; trial < this.driver.trials; trial += 1) {
      outcomes.push(await this.driver.run(prompt));
    }

    this.answered = outcomes;
  }

  checkCreated(): void {
    this.checkEveryTrial([input => arenaOutcomeMatches(input, "created")]);
  }

  checkArenaGiven(): void {
    this.checkEveryTrial([arenaGiven]);
  }

  checkKeepsCover(): void {
    this.checkEveryTrial([input => arenaOutcomeMatches(input, "created"), arenaKeepsCover]);
  }

  checkBuiltInGiven(): void {
    this.checkEveryTrial([input => arenaOutcomeMatches(input, "builtIn")]);
  }

  checkRejected(): void {
    this.checkEveryTrial([input => arenaOutcomeMatches(input, "rejected")]);
  }

  checkSafeToShow(): void {
    this.checkEveryTrial([playableArena, arenaNoPromptLeak]);
  }

  checkFixedPathWithin(maximumModelCalls: number): void {
    this.checkEveryTrial([arenaNodePath, input => arenaModelCallBudget(input, maximumModelCalls)]);
  }

  checkModelCallsAtMost(maximumModelCalls: number): void {
    this.checkEveryTrial([input => arenaModelCallBudget(input, maximumModelCalls)]);
  }

  checkRefundedOnlyForBuiltIn(): void {
    this.checkEveryTrial([builtInRefunded]);
  }

  private checkEveryTrial(checks: ArenaEvaluator[]): void {
    if (this.answered.length === 0) {
      throw new Error("Ask for an arena (in a beforeAll) before expecting anything");
    }

    const inputs = this.answered.map(outcome => ({outcome}));
    const failures = checks.flatMap(check => failuresAcrossTrials(inputs, check));
    if (failures.length > 0) {
      throw new Error(failures.join("; "));
    }
  }
}
