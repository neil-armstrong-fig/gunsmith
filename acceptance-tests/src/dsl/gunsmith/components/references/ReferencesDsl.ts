import type {Page} from "@playwright/test";
import {ReferencesPlaywright} from "@src/dsl/gunsmith/components/references/playwright/ReferencesPlaywright";
import {DslError} from "@src/dsl/gunsmith/errors/DslError";

export class ReferencesDsl {
  private readonly references: ReferencesPlaywright;

  constructor(page: Page) {
    this.references = new ReferencesPlaywright(page);
  }

  async open(): Promise<void> {
    try {
      await this.references.open();
    } catch (error) {
      throw new DslError("Failed to open the references in a separate tab", error);
    }
  }

  async getFoleySource(): Promise<string | undefined> {
    try {
      return await this.references.getFoleySource();
    } catch (error) {
      throw new DslError("Failed to find Greg Lester's Foley guide on the references page", error);
    }
  }
}
