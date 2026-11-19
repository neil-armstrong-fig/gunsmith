import {DslError} from "@evals/dsl/shared/errors/DslError";
import type {TrialDsl} from "@evals/dsl/shared/types/TrialDsl";
import type {WeaponOutcomeStatus} from "@gunsmith/ai/pipeline/types/WeaponOutcomeStatus";
import type {WeaponPipelineDriver} from "@evals/dsl/weapon/types/WeaponPipelineDriver";
import {WeaponPipeline} from "@evals/dsl/weapon/pipeline/WeaponPipeline";

/**
 * The weapon smith as a test sees it: ask it for a weapon, then say what must be true of its answer. Every method only wraps
 * the pipeline beneath it in a `try` / `catch` and rethrows a `DslError` that says what was attempted, so a failed criterion reads
 * as one sentence (what was expected, then why it did not hold). `WeaponPipeline` does the work. A spec takes the
 * DSL into a scope for each trial (`eachTrial`, with `forTrial()`), so each holds one answer. This is the eval counterpart of `GunsmithDsl` over `GunsmithPlaywright` in
 * `acceptance-tests/`. An `expect` changes nothing, so the `then`s of one `when` can share one `ask`.
 */
export class WeaponDsl implements TrialDsl<WeaponDsl> {
  readonly domain = "weapon";
  private readonly pipeline: WeaponPipeline;

  constructor(private readonly driver: WeaponPipelineDriver) {
    this.pipeline = new WeaponPipeline(driver);
  }

  /** How many times a request is run, which a spec reads to give each trial its own scope. */
  get trials(): number {
    return this.driver.trials;
  }

  /** A DSL for one trial: it asks once, on this DSL's driver, and holds only that trial's answer. */
  forTrial(): WeaponDsl {
    return new WeaponDsl({trials: 1, run: prompt => this.driver.run(prompt)});
  }

  /** Puts a player's request through the pipeline replacing the answer of any earlier request. */
  async ask(prompt: string): Promise<void> {
    try {
      await this.pipeline.ask(prompt);
    } catch (error) {
      throw new DslError(`Failed to ask the weapon smith for "${prompt}"`, error);
    }
  }

  /** How the request ended: created, rejected or invalid. The reading of one trial, so the spec states what it expects. */
  getStatus(): WeaponOutcomeStatus {
    try {
      return this.pipeline.statusOfTheAnswer();
    } catch (error) {
      throw new DslError("Expected to read the status of the request", error);
    }
  }

  /** The damage per second of the weapon that was created. The cap is the spec's to state, not this reading's. */
  getDamagePerSecond(): number {
    try {
      return this.pipeline.damagePerSecondOfTheAnswer();
    } catch (error) {
      throw new DslError("Expected to read the damage per second of the weapon", error);
    }
  }

  /** How many model calls the request cost, all stages together. The budget is the spec's to state. */
  getModelCalls(): number {
    try {
      return this.pipeline.modelCallsOfTheAnswer();
    } catch (error) {
      throw new DslError("Expected to read how many model calls the request cost", error);
    }
  }

  /** The graph nodes the request ran, in order (a created weapon's stats nodes, then its drawing's with an `appearance.` prefix). */
  getNodes(): string[] {
    try {
      return this.pipeline.nodesOfTheAnswer();
    } catch (error) {
      throw new DslError("Expected to read the nodes the request ran", error);
    }
  }

  /** What is wrong with the drawing shown, if anything: it must be valid and a stand-in must never be passed off as the model's own. A request turned away must have none, so a spec also states the status when it needs a weapon to have been drawn. */
  getDrawingProblems(): string[] {
    try {
      return this.pipeline.drawingProblems();
    } catch (error) {
      throw new DslError("Expected to read the problems with the drawing shown", error);
    }
  }

  /** What is wrong with the name of any weapon created, if anything: markup, template characters, or enough length to carry an instruction. */
  getNameProblems(): string[] {
    try {
      return this.pipeline.nameProblems();
    } catch (error) {
      throw new DslError("Expected to read the problems with the weapon's name", error);
    }
  }

  /** Where the system prompt's canary token shows in anything the player can see, if it does. */
  getPromptLeakProblems(): string[] {
    try {
      return this.pipeline.promptLeakProblems();
    } catch (error) {
      throw new DslError("Expected to read where the system prompt leaked", error);
    }
  }

  /** What makes what the player is shown unsafe, if anything: a weapon that does not parse or is over the damage cap, an unplain name, an invalid drawing (or one for a request turned away), a leaked prompt. */
  getSafeToShowProblems(): string[] {
    try {
      return this.pipeline.safeToShowProblems();
    } catch (error) {
      throw new DslError("Expected to read the problems with what the player sees", error);
    }
  }

  /** Where the pipeline left its fixed order, if it did: pre-check first, each stage repaired at most once, a created weapon validated, balanced and rated, then drawn. */
  getFixedPathProblems(): string[] {
    try {
      return this.pipeline.fixedPathProblems();
    } catch (error) {
      throw new DslError("Expected to read the problems with the pipeline's path", error);
    }
  }
}
