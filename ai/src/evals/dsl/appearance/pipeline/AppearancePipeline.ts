import {appearancePath} from "@evals/dsl/appearance/pipeline/evaluators/outcome/AppearancePath";
import {appearanceCallBudget} from "@evals/dsl/appearance/pipeline/evaluators/outcome/AppearanceCallBudget";
import {outputTokenBudget} from "@evals/dsl/appearance/pipeline/evaluators/outcome/OutputTokenBudget";
import {drawnByTheModel} from "@evals/dsl/appearance/pipeline/evaluators/outcome/DrawnByTheModel";
import {drawingValid} from "@evals/dsl/appearance/pipeline/evaluators/drawing/DrawingValid";
import {drawingVisible} from "@evals/dsl/appearance/pipeline/evaluators/drawing/DrawingVisible";
import {standInDisclosed} from "@evals/dsl/appearance/pipeline/evaluators/drawing/StandInDisclosed";
import type {AppearanceEvalInput} from "@evals/dsl/appearance/pipeline/types/AppearanceEvalInput";
import type {AppearanceEvaluator} from "@evals/dsl/appearance/pipeline/types/AppearanceEvaluator";
import type {AppearanceDriver} from "@evals/dsl/appearance/types/AppearanceDriver";
import {failuresAcrossTrials} from "@evals/dsl/shared/trials/FailuresAcrossTrials";
import type {AppearanceOutcome} from "@gunsmith/ai/pipeline/appearance/types/AppearanceOutcome";

/**
 * The weapon's appearance pipeline as seen from outside, the system under test: the one class that knows how to put a request
 * through it and how to read what came back, as `WeaponPipeline` is for the weapon and `GunsmithPlaywright` is for the game.
 * `ask` runs the request once for every trial (a model's drawing varies) and holds the answers; each `check…` runs pure evaluators
 * over them and holds only if it held in every trial (pass^k), throwing one sentence per check that failed. It catches nothing and
 * wraps nothing: `AppearanceDsl` says what was being attempted. LangChain is beneath it, behind the driver.
 */
export class AppearancePipeline {
  private readonly driver: AppearanceDriver;
  private answered: AppearanceOutcome[] = [];

  constructor(driver: AppearanceDriver) {
    this.driver = driver;
  }

  /** Puts a player's request through the appearance pipeline, once for every trial, replacing any earlier answers. */
  async ask(prompt: string): Promise<void> {
    const outcomes: AppearanceOutcome[] = [];

    for (let trial = 0; trial < this.driver.trials; trial += 1) {
      outcomes.push(await this.driver.run(prompt));
    }

    this.answered = outcomes;
  }

  checkDrawnByTheModel(maximumRepairs: number): void {
    this.checkEveryTrial([input => drawnByTheModel(input, maximumRepairs)]);
  }

  checkOutputTokensAtMost(maximumOutputTokens: number): void {
    this.checkEveryTrial([input => outputTokenBudget(input, maximumOutputTokens)]);
  }

  checkSafeToShow(): void {
    this.checkEveryTrial([drawingValid, drawingVisible]);
  }

  checkStandInDisclosed(): void {
    this.checkEveryTrial([standInDisclosed]);
  }

  checkFixedPathWithin(maximumModelCalls: number): void {
    this.checkEveryTrial([appearancePath, input => appearanceCallBudget(input, maximumModelCalls)]);
  }

  private checkEveryTrial(checks: AppearanceEvaluator[]): void {
    if (this.answered.length === 0) {
      throw new Error("Ask for an appearance (in a beforeAll) before expecting anything");
    }

    const inputs: AppearanceEvalInput[] = this.answered.map(outcome => ({outcome}));
    const failures = checks.flatMap(check => failuresAcrossTrials(inputs, check));
    if (failures.length > 0) {
      throw new Error(failures.join("; "));
    }
  }
}
