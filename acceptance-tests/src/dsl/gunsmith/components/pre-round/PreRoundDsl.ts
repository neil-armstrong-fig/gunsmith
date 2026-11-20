import type {Page} from "@playwright/test";
import {ArenaPreRoundDsl} from "@src/dsl/gunsmith/components/pre-round/components/arena/ArenaPreRoundDsl";
import {PreRoundPlaywright} from "@src/dsl/gunsmith/components/pre-round/playwright/PreRoundPlaywright";
import type {PreRoundReveal} from "@src/dsl/gunsmith/components/pre-round/types/PreRoundReveal";
import {DslError} from "@src/dsl/gunsmith/errors/DslError";

/** The pre-round: the choosing of weapons over the dimmed arena before a match against the bot, and the front door that leads to it, reached as `gunsmith.preRound`. */
export class PreRoundDsl {
  readonly arena: ArenaPreRoundDsl;
  private readonly preRound: PreRoundPlaywright;

  constructor(page: Page) {
    this.arena = new ArenaPreRoundDsl(page);
    this.preRound = new PreRoundPlaywright(page);
  }

  /** Whether the practice range offers "Fight the bot". */
  async hasFightTheBot(): Promise<boolean> {
    try {
      return await this.preRound.hasFightTheBot();
    } catch (error) {
      throw new DslError("Failed to see whether Fight the bot is offered", error);
    }
  }

  /** Presses "Fight the bot" on the practice range and waits for the pre-round to be on the screen. */
  async fightTheBot(): Promise<void> {
    try {
      await this.preRound.fightTheBot();
    } catch (error) {
      throw new DslError("Failed to press Fight the bot", error);
    }
  }

  /** Whether the pre-round's panel is on the screen. */
  async isOpen(): Promise<boolean> {
    try {
      return await this.preRound.isOpen();
    } catch (error) {
      throw new DslError("Failed to see whether the pre-round is open", error);
    }
  }

  /** The names offered for a weapon slot (1 or 2), built-ins first and then the shelf. */
  async getChoices(slot: number): Promise<string[]> {
    try {
      return await this.preRound.getChoices(slot);
    } catch (error) {
      throw new DslError(`Failed to read the choices for weapon ${slot}`, error);
    }
  }

  /** The name chosen for a weapon slot right now. */
  async getChosen(slot: number): Promise<string> {
    try {
      return await this.preRound.getChosen(slot);
    } catch (error) {
      throw new DslError(`Failed to read the choice for weapon ${slot}`, error);
    }
  }

  /** Chooses the weapon with `name` for a slot. */
  async choose(slot: number, name: string): Promise<void> {
    try {
      await this.preRound.choose(slot, name);
    } catch (error) {
      throw new DslError(`Failed to choose ${name} for weapon ${slot}`, error);
    }
  }

  /** Presses Lock in, which shows the reveal. */
  async lockIn(): Promise<void> {
    try {
      await this.preRound.lockIn();
    } catch (error) {
      throw new DslError("Failed to press Lock in", error);
    }
  }

  /** Whether the reveal is on the screen. */
  async isRevealShown(): Promise<boolean> {
    try {
      return await this.preRound.isRevealShown();
    } catch (error) {
      throw new DslError("Failed to see whether the reveal is shown", error);
    }
  }

  /** The weapons the reveal shows for each side. */
  async getReveal(): Promise<PreRoundReveal> {
    try {
      return await this.preRound.getReveal();
    } catch (error) {
      throw new DslError("Failed to read the reveal", error);
    }
  }

  /** Presses "Start the match" on the reveal, which begins round 1. */
  async startTheMatch(): Promise<void> {
    try {
      await this.preRound.startTheMatch();
    } catch (error) {
      throw new DslError("Failed to press Start the match", error);
    }
  }
}
