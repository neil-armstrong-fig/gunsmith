import {appearancePath} from "@evals/dsl/appearance/pipeline/evaluators/outcome/AppearancePath";
import {drawingValid} from "@evals/dsl/appearance/pipeline/evaluators/drawing/DrawingValid";
import {drawingVisible} from "@evals/dsl/appearance/pipeline/evaluators/drawing/DrawingVisible";
import {noDisguisedStandIn} from "@evals/dsl/appearance/pipeline/evaluators/drawing/NoDisguisedStandIn";
import type {AppearanceEvaluator} from "@evals/dsl/appearance/pipeline/types/AppearanceEvaluator";
import type {AppearanceDriver} from "@evals/dsl/appearance/types/AppearanceDriver";
import {failuresOf} from "@evals/dsl/shared/checks/FailuresOf";
import type {AppearanceOutcome} from "@gunsmith/ai/pipeline/appearance/types/AppearanceOutcome";
import type {AppearanceOutcomeStatus} from "@gunsmith/ai/pipeline/appearance/types/AppearanceOutcomeStatus";

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

  /** How the drawing ended: valid, completed, repaired, or the plain stand-in. */
  statusOfTheAnswer(): AppearanceOutcomeStatus {
    return this.theAnswer().status;
  }

  /** The steps that ran, in order. */
  nodesOfTheAnswer(): string[] {
    return this.theAnswer().nodes;
  }

  /** The model calls the drawing cost. */
  modelCallsOfTheAnswer(): number {
    return this.theAnswer().modelCalls;
  }

  /** The tokens the model wrote for the request, repair included, as it reported them. */
  outputTokensOfTheAnswer(): number {
    return this.theAnswer().usage.outputTokens;
  }

  safeToShowProblems(): string[] {
    return this.problemsOf([drawingValid, drawingVisible]);
  }

  standInProblems(): string[] {
    return this.problemsOf([noDisguisedStandIn]);
  }

  fixedPathProblems(): string[] {
    return this.problemsOf([appearancePath]);
  }

  private theAnswer(): AppearanceOutcome {
    if (!this.answered) {
      throw new Error("Ask for an appearance (in a beforeAll) before expecting anything");
    }

    return this.answered;
  }

  private problemsOf(checks: AppearanceEvaluator[]): string[] {
    return failuresOf({outcome: this.theAnswer()}, checks);
  }
}
