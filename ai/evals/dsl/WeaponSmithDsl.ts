import {DslError} from "@evals/dsl/errors/DslError";
import type {StandingCriterion} from "@evals/dsl/types/StandingCriterion";
import type {WeaponPipelineDriver} from "@evals/dsl/types/WeaponPipelineDriver";
import {WeaponSmithPipeline} from "@evals/dsl/pipeline/WeaponSmithPipeline";

// The most model calls any request may cost: moderation, generation and at most one repair of the stats, then the drawing and at
// most one repair of that (the user's call budget, 2026-11-15; three when nothing needs repairing).
const MAXIMUM_MODEL_CALLS = 5;

/**
 * The weapon smith as a test sees it: ask it for a weapon, then say what must be true of its answer. Every method only wraps
 * the pipeline beneath it in a `try` / `catch` and rethrows a `DslError` that says what was attempted, so a failed criterion reads
 * as one sentence (what was expected, then why it did not hold). `WeaponSmithPipeline` does the work: it asks, once for every
 * trial, and checks the answers in every trial. This is the eval counterpart of `GunsmithDsl` over `GunsmithPlaywright` in
 * `acceptance-tests/`. An `expect` changes nothing, so the `then`s of one `when` can share one `ask`.
 */
export class WeaponSmithDsl {
  private readonly pipeline: WeaponSmithPipeline;

  constructor(driver: WeaponPipelineDriver) {
    this.pipeline = new WeaponSmithPipeline(driver);
  }

  /** Puts a player's request through the pipeline, once for every trial, replacing the answers of any earlier request. */
  async ask(prompt: string): Promise<void> {
    try {
      await this.pipeline.ask(prompt);
    } catch (error) {
      throw new DslError(`Failed to ask the weapon smith for "${prompt}"`, error);
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
   * A weapon was created and code brought it inside the limits (it was balanced), with no repair: the model is never asked to fix a
   * stat that is too strong, because it can lower the wrong one.
   */
  expectBalancedByCode(): void {
    try {
      this.pipeline.checkBalancedByCode();
    } catch (error) {
      throw new DslError("Expected the weapon to be balanced by code, with no repair", error);
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

  /**
   * What holds whatever was asked, so a test does not repeat it: nothing unsafe is shown, and the pipeline keeps to its fixed path
   * within its five model calls. The mapping reports each under every `when`; a test states only what is special to its request,
   * such as a tighter budget.
   */
  standingCriteria(): StandingCriterion[] {
    return [
      {
        description: "whatever is asked, what the player sees is safe to show",
        expect: () => this.expectSafeToShow(),
      },
      {
        description: "whatever is asked, the pipeline keeps to its fixed path, within five model calls",
        expect: () => this.expectFixedPathWithinModelCalls(MAXIMUM_MODEL_CALLS),
      },
    ];
  }

  private expectFixedPathWithinModelCalls(maximumModelCalls: number): void {
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
