import type {WeaponPipelineDriver} from "@evals/dsl/weapon/types/WeaponPipelineDriver";
import {balancedByCode} from "@evals/dsl/weapon/pipeline/evaluators/outcome/BalancedByCode";
import {drawnWhenCreated} from "@evals/dsl/weapon/pipeline/evaluators/drawing/DrawnWhenCreated";
import {modelCallBudget} from "@evals/dsl/weapon/pipeline/evaluators/outcome/ModelCallBudget";
import {nodePath} from "@evals/dsl/weapon/pipeline/evaluators/outcome/NodePath";
import {outcomeMatches} from "@evals/dsl/weapon/pipeline/evaluators/outcome/OutcomeMatches";
import {nameHygiene} from "@evals/dsl/weapon/pipeline/evaluators/created-weapon/NameHygiene";
import {noPromptLeak} from "@evals/dsl/weapon/pipeline/evaluators/player-visible/NoPromptLeak";
import {withinCaps} from "@evals/dsl/weapon/pipeline/evaluators/created-weapon/WithinCaps";
import {schemaValid} from "@evals/dsl/weapon/pipeline/evaluators/created-weapon/SchemaValid";
import {damagePerSecondOf} from "@evals/dsl/weapon/pipeline/evaluators/created-weapon/DamagePerSecond";
import {failuresOf} from "@evals/dsl/shared/checks/FailuresOf";
import type {WeaponEvaluator} from "@evals/dsl/weapon/pipeline/types/WeaponEvaluator";
import type {WeaponOutcome} from "@gunsmith/ai/pipeline/types/WeaponOutcome";
import type {WeaponOutcomeStatus} from "@gunsmith/ai/pipeline/types/WeaponOutcomeStatus";

/**
 * The weapon smith's pipeline as seen from outside, the system under test: the one class that knows how to put a request through
 * it and how to read what came back. It is to the evals what `GunsmithPlaywright` is to the game in `acceptance-tests/`, and the
 * DSL above it is a thin wrapper, as `GunsmithDsl` is. `ask` runs the request once and holds the answer; each
 * `check…` runs pure evaluators over it, throwing one sentence per check that failed and why, as `expect.poll` conditions throw inside a
 * `*Playwright` (each trial is a scope of its own, so that a criterion held in every trial, pass^k, is the mapping's).
 * It catches nothing and wraps nothing: the DSL says what was being attempted. LangChain and LangGraph are beneath it, behind
 * the driver, as the browser is beneath Playwright.
 */
export class WeaponPipeline {
  private readonly driver: WeaponPipelineDriver;
  private answered: WeaponOutcome | undefined;

  constructor(driver: WeaponPipelineDriver) {
    this.driver = driver;
  }

  /** Puts a player's request through the pipeline, replacing any earlier answer. */
  async ask(prompt: string): Promise<void> {
    this.answered = await this.driver.run(prompt);
  }

  /** How the request ended. */
  statusOfTheAnswer(): WeaponOutcomeStatus {
    return this.theAnswer().status;
  }

  /** The damage per second of the weapon that was created. */
  damagePerSecondOfTheAnswer(): number {
    const outcome = this.theAnswer();
    const damagePerSecond = damagePerSecondOf(outcome.weapon);
    if (damagePerSecond === undefined) {
      throw new Error(`No weapon was created (the request ${outcome.status}), so there is no damage per second`);
    }

    return damagePerSecond;
  }

  checkCreated(): void {
    this.checkAnswer([input => outcomeMatches(input, "created")]);
  }

  checkCreatedAndDrawn(): void {
    this.checkAnswer([input => outcomeMatches(input, "created"), drawnWhenCreated]);
  }

  checkRejected(): void {
    this.checkAnswer([input => outcomeMatches(input, "rejected")]);
  }

  checkBalancedByCode(maximumRepairs: number): void {
    this.checkAnswer([input => balancedByCode(input, maximumRepairs)]);
  }

  checkNoWeaponOverTheCap(): void {
    this.checkAnswer([withinCaps]);
  }

  checkPlainWeaponName(): void {
    this.checkAnswer([nameHygiene]);
  }

  checkNoPromptLeak(): void {
    this.checkAnswer([noPromptLeak]);
  }

  checkSafeToShow(): void {
    this.checkAnswer([schemaValid, withinCaps, nameHygiene, drawnWhenCreated, noPromptLeak]);
  }

  checkFixedPath(): void {
    this.checkAnswer([nodePath]);
  }

  checkModelCallsAtMost(maximumModelCalls: number): void {
    this.checkAnswer([input => modelCallBudget(input, maximumModelCalls)]);
  }

  checkFixedPathWithin(maximumModelCalls: number): void {
    this.checkAnswer([nodePath, input => modelCallBudget(input, maximumModelCalls)]);
  }

  private theAnswer(): WeaponOutcome {
    if (!this.answered) {
      throw new Error("Ask for a weapon (in a beforeAll) before expecting anything");
    }

    return this.answered;
  }

  private checkAnswer(checks: WeaponEvaluator[]): void {
    const failures = failuresOf({outcome: this.theAnswer()}, checks);
    if (failures.length > 0) {
      throw new Error(failures.join("; "));
    }
  }
}
