import type {Locator, Page} from "@playwright/test";
import {expect} from "@playwright/test";
import type {ArenaPick} from "@src/dsl/gunsmith/components/room/components/pre-round/types/ArenaPick";
import {BasePage} from "@src/dsl/gunsmith/playwright/BasePage";

/** The buttons of the arena pick, by what each says. */
const PICK_BUTTONS: Record<ArenaPick, string> = {
  mine: "Play my arena",
  theirs: "Play their arena",
  random: "Random",
  nothing: "Nothing",
};

export class RoomPreRoundPlaywright extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /** Waits until the room's choosing is on the screen. */
  async waitToBeChoosing(): Promise<void> {
    await expect(this.dialog()).toBeVisible();
  }

  async isOpen(): Promise<boolean> {
    return await this.dialog().isVisible();
  }

  async isWaitingForTheOtherPlayerToSit(): Promise<boolean> {
    return await this.dialog().getByTestId("room-waiting-to-sit").isVisible();
  }

  async getFriendCode(): Promise<string | undefined> {
    const code = this.dialog().getByTestId("room-friend-code");
    if (!(await code.isVisible())) {
      return undefined;
    }

    return await code.innerText();
  }

  /** The whole seconds the screen says are left, or nothing while it shows no clock. */
  async getSecondsLeft(): Promise<number | undefined> {
    const clock = this.dialog().getByTestId("room-clock");
    if (!(await clock.isVisible())) {
      return undefined;
    }

    return Number(await clock.getAttribute("data-seconds-left"));
  }

  /** Whether the weapon for `slot` can be chosen or has been locked in: the step is on the screen. */
  async hasWeaponStep(slot: number): Promise<boolean> {
    const choosing = this.dialog().getByRole("group", {name: `Weapon ${slot}`});
    const locked = this.dialog().getByTestId(`room-weapon-${slot}-locked`);

    return (await choosing.isVisible()) || (await locked.isVisible());
  }

  async lockInWeapon(slot: number): Promise<void> {
    const button = this.dialog().getByRole("button", {name: `Lock in weapon ${slot}`});
    await button.click();
    await expect(button).toBeHidden();
  }

  /** The name of the weapon this player locked in for `slot`, once it is locked in. */
  async getLockedWeapon(slot: number): Promise<string | undefined> {
    const locked = this.dialog().getByTestId(`room-weapon-${slot}-locked`);
    if (!(await locked.isVisible())) {
      return undefined;
    }

    return await locked.innerText();
  }

  /** The name of the other player's weapon in `slot` on the screen, or nothing while it is not shown. */
  async getOpponentWeapon(slot: number): Promise<string | undefined> {
    const weapon = this.dialog().getByTestId(`room-opponent-weapon-${slot}`);
    if (!(await weapon.isVisible())) {
      return undefined;
    }

    return await weapon.innerText();
  }

  /** Waits until the other player's weapon in `slot` is on the screen, and says its name. */
  async waitForTheOpponentWeapon(slot: number): Promise<string> {
    const weapon = this.dialog().getByTestId(`room-opponent-weapon-${slot}`);
    await expect(weapon).toBeVisible();

    return await weapon.innerText();
  }

  async hasArenaStep(): Promise<boolean> {
    const choosing = this.dialog().getByRole("group", {name: "Arena", exact: true});
    const locked = this.dialog().getByTestId("room-arena-locked");

    return (await choosing.isVisible()) || (await locked.isVisible());
  }

  async lockInArena(): Promise<void> {
    const button = this.dialog().getByRole("button", {name: "Lock in arena"});
    await button.click();
    await expect(button).toBeHidden();
  }

  /** The name of the other player's arena on the screen, or nothing while it is not shown. */
  async getOpponentArena(): Promise<string | undefined> {
    const arena = this.dialog().getByTestId("room-opponent-arena");
    if (!(await arena.isVisible())) {
      return undefined;
    }

    return await arena.innerText();
  }

  async waitForTheOpponentArena(): Promise<string> {
    const arena = this.dialog().getByTestId("room-opponent-arena");
    await expect(arena).toBeVisible();

    return await arena.innerText();
  }

  async hasArenaPick(): Promise<boolean> {
    return await this.dialog().getByTestId("room-arena-pick").isVisible();
  }

  async waitForTheArenaPick(): Promise<void> {
    await expect(this.dialog().getByTestId("room-arena-pick")).toBeVisible();
  }

  async pickArena(pick: ArenaPick): Promise<void> {
    await this.dialog()
      .getByTestId("room-arena-pick")
      .getByRole("button", {name: PICK_BUTTONS[pick], exact: true})
      .click();
  }

  /** How the arena was settled, as the screen says it, once it has. */
  async getHow(): Promise<string> {
    const how = this.dialog().getByTestId("room-arena-how");
    await expect(how).toBeVisible();

    return await how.innerText();
  }

  /** Waits until what was decided is on the screen. */
  async waitForTheReveal(): Promise<void> {
    await expect(this.dialog().getByTestId("reveal")).toBeVisible();
  }

  async askToStartTheMatch(): Promise<void> {
    await this.dialog().getByRole("button", {name: "Start the match"}).click();
  }

  async isWaitingForTheOtherPlayerToStart(): Promise<boolean> {
    return await this.dialog().getByTestId("room-start-waiting").isVisible();
  }

  private dialog(): Locator {
    return this.page.getByRole("dialog", {name: "Pre-round"});
  }
}
