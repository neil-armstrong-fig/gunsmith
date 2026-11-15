import type {WeaponPipelineDriver} from "@evals/dsl/types/WeaponPipelineDriver";
import {balancedByCode} from "@evals/dsl/pipeline/evaluators/outcome/BalancedByCode";
import {modelCallBudget} from "@evals/dsl/pipeline/evaluators/outcome/ModelCallBudget";
import {nodePath} from "@evals/dsl/pipeline/evaluators/outcome/NodePath";
import {outcomeMatches} from "@evals/dsl/pipeline/evaluators/outcome/OutcomeMatches";
import {nameHygiene} from "@evals/dsl/pipeline/evaluators/weapon/NameHygiene";
import {noPromptLeak} from "@evals/dsl/pipeline/evaluators/player-visible/NoPromptLeak";
import {withinCaps} from "@evals/dsl/pipeline/evaluators/weapon/WithinCaps";
import {schemaValid} from "@evals/dsl/pipeline/evaluators/weapon/SchemaValid";
import {failuresAcrossTrials} from "@evals/dsl/trials/FailuresAcrossTrials";
import type {WeaponEvaluator} from "@evals/dsl/pipeline/types/WeaponEvaluator";
import type {WeaponOutcome} from "@gunsmith/ai/pipeline/types/WeaponOutcome";

/**
 * The weapon smith's pipeline as seen from outside, the system under test: the one class that knows how to put a request through
 * it and how to read what came back. It is to the evals what `GunsmithPlaywright` is to the game in `acceptance-tests/`, and the
 * DSL above it is a thin wrapper, as `GunsmithDsl` is. `ask` runs the request once for every trial (a model's answer varies) and
 * holds the answers; each `check…` runs pure evaluators over them and holds only if it held in every trial (pass^k), throwing one
 * sentence per check that failed with the trials it failed in and why, as `expect.poll` conditions throw inside a `*Playwright`.
 * It catches nothing and wraps nothing: the DSL says what was being attempted. LangChain and LangGraph are beneath it, behind
 * the driver, as the browser is beneath Playwright.
 */
export class WeaponSmithPipeline {
  private readonly driver: WeaponPipelineDriver;
  private answered: WeaponOutcome[] = [];

  constructor(driver: WeaponPipelineDriver) {
    this.driver = driver;
  }

  /** Puts a player's request through the pipeline, once for every trial, replacing any earlier answers. */
  async ask(prompt: string): Promise<void> {
    const outcomes: WeaponOutcome[] = [];

    for (let trial = 0; trial < this.driver.trials; trial += 1) {
      outcomes.push(await this.driver.run(prompt));
    }

    this.answered = outcomes;
  }

  checkCreated(): void {
    this.checkEveryTrial([input => outcomeMatches(input, "created")]);
  }

  checkRejected(): void {
    this.checkEveryTrial([input => outcomeMatches(input, "rejected")]);
  }

  checkBalancedByCode(): void {
    this.checkEveryTrial([balancedByCode]);
  }

  checkNoWeaponOverTheCap(): void {
    this.checkEveryTrial([withinCaps]);
  }

  checkPlainWeaponName(): void {
    this.checkEveryTrial([nameHygiene]);
  }

  checkNoPromptLeak(): void {
    this.checkEveryTrial([noPromptLeak]);
  }

  checkSafeToShow(): void {
    this.checkEveryTrial([schemaValid, withinCaps, nameHygiene, noPromptLeak]);
  }

  checkFixedPath(): void {
    this.checkEveryTrial([nodePath]);
  }

  checkModelCallsAtMost(maximumModelCalls: number): void {
    this.checkEveryTrial([input => modelCallBudget(input, maximumModelCalls)]);
  }

  checkFixedPathWithin(maximumModelCalls: number): void {
    this.checkEveryTrial([nodePath, input => modelCallBudget(input, maximumModelCalls)]);
  }

  private checkEveryTrial(checks: WeaponEvaluator[]): void {
    if (this.answered.length === 0) {
      throw new Error("Ask for a weapon (in a beforeAll) before expecting anything");
    }

    const inputs = this.answered.map(outcome => ({outcome}));
    const failures = checks.flatMap(check => failuresAcrossTrials(inputs, check));
    if (failures.length > 0) {
      throw new Error(failures.join("; "));
    }
  }
}
