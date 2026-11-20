import type {Page} from "@playwright/test";
import {ShelfPlaywright} from "@src/dsl/gunsmith/components/workshop/components/shelf/playwright/ShelfPlaywright";
import type {ShelfItem} from "@src/dsl/gunsmith/components/workshop/components/shelf/types/ShelfItem";
import type {ShelfMeter} from "@src/dsl/gunsmith/components/workshop/components/shelf/types/ShelfMeter";
import {DslError} from "@src/dsl/gunsmith/errors/DslError";

/** The weapon shelf in the workshop and the Save button on the result card, reached as `gunsmith.workshop.shelf`. */
export class ShelfDsl {
  private readonly shelf: ShelfPlaywright;

  constructor(page: Page) {
    this.shelf = new ShelfPlaywright(page);
  }

  /** Presses Save on the result card. With the shelf full it asks which saved weapon to replace instead. */
  async save(): Promise<void> {
    try {
      await this.shelf.save();
    } catch (error) {
      throw new DslError("Failed to press Save", error);
    }
  }

  /** Whether the result card offers a Save that can be pressed. */
  async canSave(): Promise<boolean> {
    try {
      return await this.shelf.canSave();
    } catch (error) {
      throw new DslError("Failed to see whether Save can be pressed", error);
    }
  }

  /** Whether the result card says its weapon is saved. */
  async isSaved(): Promise<boolean> {
    try {
      return await this.shelf.isSaved();
    } catch (error) {
      throw new DslError("Failed to see whether the card says Saved", error);
    }
  }

  /** The shelf's count against its limit. */
  async getMeter(): Promise<ShelfMeter> {
    try {
      return await this.shelf.getMeter();
    } catch (error) {
      throw new DslError("Failed to read the shelf's count", error);
    }
  }

  /** Every weapon on the shelf, in the order the shelf shows them. */
  async getItems(): Promise<ShelfItem[]> {
    try {
      return await this.shelf.getItems();
    } catch (error) {
      throw new DslError("Failed to read the shelf", error);
    }
  }

  /** Presses Try it on the shelf's weapon at `index` (from 0): the weapon goes in slot 2 and the workshop shuts. */
  async tryItem(index: number): Promise<void> {
    try {
      await this.shelf.tryItem(index);
    } catch (error) {
      throw new DslError(`Failed to press Try it on shelf weapon ${index}`, error);
    }
  }

  /** Presses Iterate on the shelf's weapon at `index`: its prompt and its card come back into the workshop. */
  async iterateItem(index: number): Promise<void> {
    try {
      await this.shelf.iterateItem(index);
    } catch (error) {
      throw new DslError(`Failed to press Iterate on shelf weapon ${index}`, error);
    }
  }

  /** Presses Delete on the shelf's weapon at `index`. */
  async deleteItem(index: number): Promise<void> {
    try {
      await this.shelf.deleteItem(index);
    } catch (error) {
      throw new DslError(`Failed to press Delete on shelf weapon ${index}`, error);
    }
  }

  /** Whether the card is asking which saved weapon to replace. */
  async isAskingWhichToReplace(): Promise<boolean> {
    try {
      return await this.shelf.isAskingWhichToReplace();
    } catch (error) {
      throw new DslError("Failed to see whether the card asks which weapon to replace", error);
    }
  }

  /** The visible saved prompts in the order of the replacement choices. */
  async getReplacementPrompts(): Promise<string[]> {
    try {
      return await this.shelf.getReplacementPrompts();
    } catch (error) {
      throw new DslError("Failed to read the prompts in the replacement choices", error);
    }
  }

  /** Presses Replace beside the saved weapon at `index` in the card's question. */
  async replaceItem(index: number): Promise<void> {
    try {
      await this.shelf.replaceItem(index);
    } catch (error) {
      throw new DslError(`Failed to press Replace on shelf weapon ${index}`, error);
    }
  }

  /** Presses Cancel in the card's question about which saved weapon to replace. */
  async cancelReplace(): Promise<void> {
    try {
      await this.shelf.cancelReplace();
    } catch (error) {
      throw new DslError("Failed to press Cancel", error);
    }
  }
}
