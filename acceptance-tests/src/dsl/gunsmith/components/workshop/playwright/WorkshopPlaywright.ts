import type {Locator, Page} from "@playwright/test";
import type {PowerMeter} from "@src/dsl/gunsmith/components/workshop/types/PowerMeter";
import type {PromptCount} from "@src/dsl/gunsmith/components/workshop/types/PromptCount";
import type {WeaponResult} from "@src/dsl/gunsmith/components/workshop/types/WeaponResult";
import {BasePage} from "@src/dsl/gunsmith/playwright/BasePage";

/** The key that opens the workshop on the practice range. */
const WORKSHOP_KEY = "KeyB";

/** The key that stands the practice range's dummies up again and refills the weapons. */
const RESET_KEY = "KeyT";

export class WorkshopPlaywright extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.page.keyboard.press(WORKSHOP_KEY);
  }

  async close(): Promise<void> {
    await this.page.keyboard.press("Escape");
  }

  async resetTheRange(): Promise<void> {
    await this.page.keyboard.press(RESET_KEY);
  }

  async isOpen(): Promise<boolean> {
    return await this.page.getByRole("dialog", {name: "Workshop"}).isVisible();
  }

  /** Key by key, as a person types, so every key the game listens for is pressed as well. */
  async typeThePrompt(text: string): Promise<void> {
    await this.promptBox().pressSequentially(text);
  }

  /** All at once, as a paste would, for a text too long to type. */
  async pasteThePrompt(text: string): Promise<void> {
    await this.promptBox().fill(text);
  }

  async make(): Promise<void> {
    await this.page.getByRole("button", {name: "Make"}).click();
  }

  async tryIt(): Promise<void> {
    await this.page.getByTestId("workshop-result").getByRole("button", {name: "Try it"}).click();
  }

  async hasTryIt(): Promise<boolean> {
    return await this.page.getByTestId("workshop-result").getByRole("button", {name: "Try it"}).isVisible();
  }

  /** Presses the mouse button down on the panel's own title, in empty space that is no button, and keeps it down. */
  async holdTheMouseOnThePanel(): Promise<void> {
    await this.page.getByRole("heading", {name: "Workshop"}).hover();
    await this.page.mouse.down();
  }

  async getPrompt(): Promise<string> {
    return await this.promptBox().inputValue();
  }

  async getPromptCount(): Promise<PromptCount> {
    const text = await this.page.getByTestId("workshop-count").innerText();
    const [length, limit] = text.split("/").map(part => Number.parseInt(part.trim(), 10));
    const over = (await this.promptBox().getAttribute("aria-invalid")) === "true";

    return {length: length ?? Number.NaN, limit: limit ?? Number.NaN, over};
  }

  async canMake(): Promise<boolean> {
    return await this.page.getByRole("button", {name: "Make"}).isEnabled();
  }

  async hasResult(): Promise<boolean> {
    return await this.page.getByTestId("workshop-result").isVisible();
  }

  async getResult(): Promise<WeaponResult> {
    const card = this.page.getByTestId("workshop-result");
    const picture = card.getByRole("img");
    const stats: Record<string, string> = {};
    for (const row of await card.getByTestId("workshop-stat").all()) {
      stats[await textOf(row.getByTestId("workshop-stat-label"))] = await textOf(
        row.getByTestId("workshop-stat-value"),
      );
    }

    return {
      name: await textOf(card.getByRole("heading")),
      rating: Number.parseInt(await textOf(card.getByTestId("workshop-rating")), 10),
      stats,
      pictureAddress: (await picture.getAttribute("src")) ?? "",
      pictureLoaded: await picture.evaluate(image => image instanceof HTMLImageElement && image.naturalWidth > 0),
    };
  }

  async getPowerMeter(): Promise<PowerMeter> {
    const meter = this.page.getByTestId("workshop-result").getByRole("meter", {name: "Power rating"});
    await meter.waitFor({state: "visible"});
    const fill = meter.getByTestId("workshop-rating-fill");

    return {
      minimum: Number.parseFloat((await meter.getAttribute("aria-valuemin")) ?? ""),
      maximum: Number.parseFloat((await meter.getAttribute("aria-valuemax")) ?? ""),
      value: Number.parseFloat((await meter.getAttribute("aria-valuenow")) ?? ""),
      trackWidth: (await meter.boundingBox())?.width ?? 0,
      fillWidth: (await fill.boundingBox())?.width ?? 0,
    };
  }

  private promptBox(): Locator {
    return this.page.getByLabel("Describe your weapon");
  }
}

async function textOf(locator: Locator): Promise<string> {
  return (await locator.innerText()).trim();
}
