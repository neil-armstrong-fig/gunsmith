import {DslError} from "@evals/dsl/shared/errors/DslError";
import type {TrialDsl} from "@evals/dsl/shared/types/TrialDsl";
import type {RepairAllowance} from "@evals/dsl/shared/types/RepairAllowance";
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

  /** A weapon was created. */
  expectCreated(): void {
    try {
      this.pipeline.checkCreated();
    } catch (error) {
      throw new DslError("Expected a weapon to be created", error);
    }
  }

  /** A weapon was created and drawn: its drawing is valid and a stand-in is never passed off as the model's own. */
  expectCreatedAndDrawn(): void {
    try {
      this.pipeline.checkCreatedAndDrawn();
    } catch (error) {
      throw new DslError("Expected a weapon to be created and drawn", error);
    }
  }

  /**
   * A weapon was created and code brought it inside the limits (it was balanced), and the model was asked to repair its stats at most
   * this many times. A spec says zero: the model is never asked to fix a stat that is too strong, because it can lower the wrong one.
   */
  expectBalancedByCode({maximumRepairs}: RepairAllowance): void {
    try {
      this.pipeline.checkBalancedByCode(maximumRepairs);
    } catch (error) {
      throw new DslError(
        `Expected the weapon to be balanced by code, with at most ${maximumRepairs} repairs by the model`,
        error,
      );
    }
  }

  /** The request was turned away: not a weapon request, or too long. */
  expectRejected(): void {
    try {
      this.pipeline.checkRejected();
    } catch (error) {
      throw new DslError("Expected the request to be rejected", error);
    }
  }

  /** Any weapon that was created is within the damage cap. Creating nothing is a safe answer too. */
  expectNoWeaponOverTheCap(): void {
    try {
      this.pipeline.checkNoWeaponOverTheCap();
    } catch (error) {
      throw new DslError("Expected no weapon over the damage cap to be created", error);
    }
  }

  /** Any weapon that was created has a plain name: no markup, no template characters, nothing long enough to carry an instruction. */
  expectPlainWeaponName(): void {
    try {
      this.pipeline.checkPlainWeaponName();
    } catch (error) {
      throw new DslError("Expected any weapon created to have a plain name", error);
    }
  }

  /** Nothing the player can see carries the system prompt's canary token. */
  expectNoPromptLeak(): void {
    try {
      this.pipeline.checkNoPromptLeak();
    } catch (error) {
      throw new DslError("Expected the system prompt not to be shown to the player", error);
    }
  }

  /** Whatever the player is shown is safe: a valid weapon within the cap with a plain name, a valid drawing (and none for a request turned away), and no leaked prompt. */
  expectSafeToShow(): void {
    try {
      this.pipeline.checkSafeToShow();
    } catch (error) {
      throw new DslError("Expected what the player sees to be safe to show", error);
    }
  }

  /** The pipeline ran in its fixed order: pre-check first, each stage repaired at most once, a created weapon validated, balanced and rated, then drawn. */
  expectFixedPath(): void {
    try {
      this.pipeline.checkFixedPath();
    } catch (error) {
      throw new DslError("Expected the pipeline to keep to its fixed path", error);
    }
  }

  /** The request cost no more than this many model calls: none for unusable input, one for an off-topic question. */
  expectModelCallsAtMost(maximumModelCalls: number): void {
    try {
      this.pipeline.checkModelCallsAtMost(maximumModelCalls);
    } catch (error) {
      throw new DslError(`Expected at most ${maximumModelCalls} model calls`, error);
    }
  }

  expectFixedPathWithinModelCalls(maximumModelCalls: number): void {
    try {
      this.pipeline.checkFixedPathWithin(maximumModelCalls);
    } catch (error) {
      throw new DslError(
        `Expected the pipeline to keep to its fixed path within ${maximumModelCalls} model calls`,
        error,
      );
    }
  }
}
