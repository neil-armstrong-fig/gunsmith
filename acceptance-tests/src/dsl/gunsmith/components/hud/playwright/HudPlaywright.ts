import type {Locator, Page} from "@playwright/test";
import {expect} from "@playwright/test";
import {lookOfInventoryIcon} from "@src/dsl/gunsmith/components/hud/playwright/look-of-inventory-icon/LookOfInventoryIcon";
import type {HudAmmo} from "@src/dsl/gunsmith/components/hud/types/HudAmmo";
import type {HealthBorder} from "@src/dsl/gunsmith/components/hud/types/HealthBorder";
import type {HudMotion} from "@src/dsl/gunsmith/components/hud/types/HudMotion";
import type {InventoryIconLook} from "@src/dsl/gunsmith/components/hud/types/InventoryIconLook";
import type {InventoryReadout} from "@src/dsl/gunsmith/components/hud/types/InventoryReadout";
import type {MagazineBar} from "@src/dsl/gunsmith/components/hud/types/MagazineBar";
import {BasePage} from "@src/dsl/gunsmith/playwright/BasePage";

/** Where the in-page recorder keeps the motions it has seen, on `window`. */
const MOTIONS_NAME = "gunsmithSpecHudMotions";

export class HudPlaywright extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Starts noting every flash and every slide of a bar on the screen, from the moment the page loads. A flash lasts 180 ms and
   * a trail 350 ms, so a spec that looked for them on the screen would race them; the browser tells the page when each one
   * starts (`animationstart`, `transitionrun`), and the recorder keeps the element's `data-testid` and how long it was set to last.
   */
  async startWatching(): Promise<void> {
    await this.page.addInitScript((motionsName: string) => {
      const motions: HudMotion[] = [];
      Reflect.set(window, motionsName, motions);

      window.addEventListener("animationstart", event => {
        note(event.target, "animation", element => getComputedStyle(element).animationDuration);
      });
      window.addEventListener("transitionrun", event => {
        note(event.target, "transition", element => getComputedStyle(element).transitionDuration);
      });

      function note(
        target: EventTarget | null,
        kind: HudMotion["kind"],
        durationOf: (element: Element) => string,
      ): void {
        if (!(target instanceof Element)) {
          return;
        }

        const testId = target.getAttribute("data-testid");
        if (testId) {
          motions.push({testId, kind, durationSeconds: Number.parseFloat(durationOf(target))});
        }
      }
    }, MOTIONS_NAME);
  }

  /** Every motion of the element with this `data-testid` since the page loaded, in order. */
  async getMotions(testId: string): Promise<readonly HudMotion[]> {
    const motions = await this.page.evaluate(
      (motionsName: string): unknown => Reflect.get(window, motionsName),
      MOTIONS_NAME,
    );
    if (!Array.isArray(motions)) {
      throw new Error("The motion recorder is not installed: the page was opened without it.");
    }

    return (motions as readonly HudMotion[]).filter(motion => motion.testId === testId);
  }

  /** The border round the health panel: red while the ring is hurting the player, and none otherwise. */
  async getHealthBorder(): Promise<HealthBorder> {
    return await this.page.getByTestId("health-hud").evaluate(element => {
      const style = getComputedStyle(element);

      return {
        colour: style.outlineColor,
        widthPixels: style.outlineStyle === "none" ? 0 : Number.parseFloat(style.outlineWidth),
      };
    });
  }

  /** Waits until the health panel has its red border. */
  async waitForBorder(): Promise<void> {
    await expect.poll(async () => (await this.getHealthBorder()).widthPixels).toBeGreaterThan(0);
  }

  /** Waits until the health panel has no border. */
  async waitForNoBorder(): Promise<void> {
    await expect.poll(async () => (await this.getHealthBorder()).widthPixels).toBe(0);
  }

  /** The colour the lost part of the health bar is drawn in, as the browser computes it. */
  async getTrailColour(): Promise<string> {
    return await this.page.getByTestId("health-trail").evaluate(element => getComputedStyle(element).backgroundColor);
  }

  /** Whether the trail behind the health bar is as long as the bar itself, both measured at the same instant. */
  async isTrailAtTheBar(): Promise<boolean> {
    return await this.page.evaluate(() => {
      const bar = document.querySelector('[data-testid="health-bar"]')?.getBoundingClientRect();
      const trail = document.querySelector('[data-testid="health-trail"]')?.getBoundingClientRect();
      if (!bar || !trail) {
        throw new Error("The health bar or its trail is not on the screen.");
      }

      return Math.abs(bar.width - trail.width) < 0.5;
    });
  }

  async getAmmo(): Promise<HudAmmo> {
    return {
      slot: await this.numberIn("weapon-slot"),
      rounds: await this.numberIn("ammo-rounds"),
      reserve: await this.numberIn("ammo-reserve"),
      reloading: (await this.hud().getAttribute("data-reloading")) === "true",
    };
  }

  async getInventory(): Promise<InventoryReadout> {
    const name = this.hud().getByTestId("inventory-weapon-name");
    await expect(name).toBeVisible();

    const first = this.hud().getByTestId("inventory-slot-1");
    const second = this.hud().getByTestId("inventory-slot-2");
    const [firstIcon, secondIcon] = await Promise.all([
      this.loadedInventoryIcon(first),
      this.loadedInventoryIcon(second),
    ]);

    return {
      selectedName: await name.innerText(),
      firstIcon: (await firstIcon.getAttribute("src")) ?? undefined,
      secondIcon: (await secondIcon.getAttribute("src")) ?? undefined,
      firstSelected: (await first.getAttribute("aria-current")) === "true",
      secondSelected: (await second.getAttribute("aria-current")) === "true",
      widthPixels: await this.hud().evaluate(element => element.getBoundingClientRect().width),
    };
  }

  async getSecondInventoryIconLook(): Promise<InventoryIconLook> {
    const icon = await this.loadedInventoryIcon(this.hud().getByTestId("inventory-slot-2"));

    return await lookOfInventoryIcon(this.page, icon);
  }

  async getMagazineBar(): Promise<MagazineBar> {
    const segments = this.page.getByTestId("magazine-segment");

    return {
      segments: await segments.count(),
      filled: await segments.evaluateAll(
        elements => elements.filter(element => element.getAttribute("data-loaded") === "true").length,
      ),
    };
  }

  /** The health the screen shows the player. */
  async getHealth(): Promise<number> {
    return await this.numberIn("player-health");
  }

  /** Waits until the screen shows exactly `health`. */
  async waitForHealth(health: number): Promise<void> {
    await expect(this.page.getByTestId("player-health")).toHaveText(String(health));
  }

  /**
   * Waits until the screen shows the health the game itself says the player has, in whole points with a part of a point rounded
   * up (the ring takes health a fraction at a time, and the game's own account keeps the fraction). For a player who is still
   * being hit, where a fixed number would be stale by the time it was waited for.
   */
  async waitForHealthToMatchTheGame(): Promise<void> {
    await expect
      .poll(async () => (await this.getHealth()) === Math.ceil((await this.readGameState()).player.health), {
        intervals: [25, 50, 100],
      })
      .toBe(true);
  }

  async waitForRounds(rounds: number): Promise<void> {
    await expect(this.page.getByTestId("ammo-rounds")).toHaveText(String(rounds));
  }

  async waitForSlot(slot: number): Promise<void> {
    await expect(this.page.getByTestId("weapon-slot")).toHaveText(String(slot));
  }

  async waitForReloadToStart(): Promise<void> {
    await expect(this.hud()).toHaveAttribute("data-reloading", "true");
  }

  async waitForReloadToEnd(): Promise<void> {
    await expect(this.hud()).toHaveAttribute("data-reloading", "false");
  }

  private hud(): Locator {
    return this.page.getByTestId("ammo-hud");
  }

  private async loadedInventoryIcon(slot: Locator): Promise<Locator> {
    const icon = slot.getByTestId("inventory-icon");
    await expect(icon).toBeVisible();
    await expect
      .poll(() => icon.evaluate(element => element instanceof HTMLImageElement && element.naturalWidth > 0))
      .toBe(true);

    return icon;
  }

  private async numberIn(testId: string): Promise<number> {
    const text = await this.page.getByTestId(testId).textContent();
    if (text === null) {
      throw new Error(`The screen shows nothing in "${testId}".`);
    }

    return Number(text);
  }
}
