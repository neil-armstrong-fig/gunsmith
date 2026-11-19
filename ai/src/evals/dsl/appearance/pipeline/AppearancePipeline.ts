import {appearancePath} from "@evals/dsl/appearance/pipeline/evaluators/outcome/AppearancePath";
import {appearanceCallBudget} from "@evals/dsl/appearance/pipeline/evaluators/outcome/AppearanceCallBudget";
import {outputTokenBudget} from "@evals/dsl/appearance/pipeline/evaluators/outcome/OutputTokenBudget";
import {drawnByTheModel} from "@evals/dsl/appearance/pipeline/evaluators/outcome/DrawnByTheModel";
import {drawingValid} from "@evals/dsl/appearance/pipeline/evaluators/drawing/DrawingValid";
import {drawingVisible} from "@evals/dsl/appearance/pipeline/evaluators/drawing/DrawingVisible";
import {noDisguisedStandIn} from "@evals/dsl/appearance/pipeline/evaluators/drawing/NoDisguisedStandIn";
import type {AppearanceEvalInput} from "@evals/dsl/appearance/pipeline/types/AppearanceEvalInput";
import type {AppearanceEvaluator} from "@evals/dsl/appearance/pipeline/types/AppearanceEvaluator";
import type {AppearanceDriver} from "@evals/dsl/appearance/types/AppearanceDriver";
import {failuresOf} from "@evals/dsl/shared/checks/FailuresOf";
import type {AppearanceOutcome} from "@gunsmith/ai/pipeline/appearance/types/AppearanceOutcome";

/**
 * The weapon's appearance pipeline as seen from outside, the system under test: the one class that knows how to put a request
 * through it and how to read what came back, as `WeaponPipeline` is for the weapon and `GunsmithPlaywright` is for the game.
 * `ask` runs the request once and holds the answer; each `check…` runs pure evaluators
 * over it, throwing one sentence per check that failed (each trial is a scope of its own, so pass^k is the mapping's). It catches nothing and
 * wraps nothing: `AppearanceDsl` says what was being attempted. LangChain is beneath it, behind the driver.
 */
export class AppearancePipeline {
  private readonly driver: AppearanceDriver;
  private answered: AppearanceOutcome | undefined;

  constructor(driver: AppearanceDriver) {
    this.driver = driver;
  }

  /** Puts a player's request through the appearance pipeline, replacing any earlier answer. */
  async ask(prompt: string): Promise<void> {
    this.answered = await this.driver.run(prompt);
  }

  checkDrawnByTheModel(maximumRepairs: number): void {
    this.checkAnswer([input => drawnByTheModel(input, maximumRepairs)]);
  }

  checkOutputTokensAtMost(maximumOutputTokens: number): void {
    this.checkAnswer([input => outputTokenBudget(input, maximumOutputTokens)]);
  }

  checkSafeToShow(): void {
    this.checkAnswer([drawingValid, drawingVisible]);
  }

  checkNoDisguisedStandIn(): void {
    this.checkAnswer([noDisguisedStandIn]);
  }

  checkFixedPathWithin(maximumModelCalls: number): void {
    this.checkAnswer([appearancePath, input => appearanceCallBudget(input, maximumModelCalls)]);
  }

  private checkAnswer(checks: AppearanceEvaluator[]): void {
    if (!this.answered) {
      throw new Error("Ask for an appearance (in a beforeAll) before expecting anything");
    }

    const input: AppearanceEvalInput = {outcome: this.answered};
    const failures = failuresOf(input, checks);
    if (failures.length > 0) {
      throw new Error(failures.join("; "));
    }
  }
}
