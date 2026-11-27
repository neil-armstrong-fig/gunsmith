import type {Locator, Page} from "@playwright/test";
import {expect} from "@playwright/test";
import {arrangeSignedInPlayer} from "@src/dsl/gunsmith/components/room/components/pre-round/playwright/signed-in-player/ArrangeSignedInPlayer";
import type {ArenaPick} from "@src/dsl/gunsmith/components/room/components/pre-round/types/ArenaPick";
import type {LibraryContents} from "@src/dsl/gunsmith/components/room/components/pre-round/types/LibraryContents";
import type {SavedItemIds} from "@src/dsl/gunsmith/components/room/components/pre-round/types/SavedItemIds";
import {BasePage} from "@src/dsl/gunsmith/playwright/BasePage";
import {numbersOfWeaponCard} from "@src/dsl/gunsmith/playwright/weapon-card/NumbersOfWeaponCard";
import {pictureOfWeaponCard} from "@src/dsl/gunsmith/playwright/weapon-card/PictureOfWeaponCard";
import type {RevealPicture} from "@src/dsl/gunsmith/playwright/weapon-card/types/RevealPicture";
import type {RevealedWeaponNumbers} from "@src/dsl/gunsmith/playwright/weapon-card/types/RevealedWeaponNumbers";

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

  /** Makes this page's player a signed-in one whose library holds `library`. Call it before the room is opened, since the page asks when it loads. */
  async arrangeSignedInPlayer(library: LibraryContents): Promise<SavedItemIds> {
    return await arrangeSignedInPlayer(this.page, library);
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
    const weapon = this.opponentWeapon(slot);
    if (!(await weapon.isVisible())) {
      return undefined;
    }

    return await weapon.getByTestId("reveal-weapon-name").innerText();
  }

  /** Waits until the other player's weapon in `slot` is on the screen, and says its name. */
  async waitForTheOpponentWeapon(slot: number): Promise<string> {
    const weapon = this.opponentWeapon(slot);
    await expect(weapon).toBeVisible();

    return await weapon.getByTestId("reveal-weapon-name").innerText();
  }

  /** What the card of the other player's weapon in `slot` prints (name, power rating, stats), once it is on the screen. */
  async getOpponentWeaponNumbers(slot: number): Promise<RevealedWeaponNumbers> {
    const weapon = this.opponentWeapon(slot);
    await expect(weapon).toBeVisible();

    return await numbersOfWeaponCard(weapon);
  }

  /** The picture on the card of the other player's weapon in `slot`, once it is on the screen. */
  async getOpponentWeaponPicture(slot: number): Promise<RevealPicture> {
    const weapon = this.opponentWeapon(slot);
    await expect(weapon).toBeVisible();

    return await pictureOfWeaponCard(weapon);
  }

  /** Opens the folded weapon of the other player in `slot` to show its stats, and waits until they are shown. */
  async openTheOpponentWeapon(slot: number): Promise<void> {
    const weapon = this.opponentWeapon(slot);
    await weapon.getByRole("button", {expanded: false}).click();
    await expect(weapon.getByTestId("reveal-weapon-rating")).toBeVisible();
  }

  /** Presses the opened card of the other player's weapon in `slot` on one of its stats, not on any button, and waits until it has folded. */
  async pressTheOpponentWeaponCard(slot: number): Promise<void> {
    const weapon = this.opponentWeapon(slot);
    await weapon.getByTestId("reveal-stat").first().click();
    await expect(weapon.getByTestId("reveal-weapon-rating")).toBeHidden();
  }

  /** Whether the other player's weapon in `slot` is shown as a card with its numbers, rather than by its picture and name alone. */
  async isOpponentWeaponShownAsACard(slot: number): Promise<boolean> {
    return (await this.opponentWeapon(slot).getByTestId("reveal-weapon-rating").count()) > 0;
  }

  /** Whether the whole of the Lock in arena button lies inside the dialog as it is now, without scrolling it. */
  async canLockInTheArenaWithoutScrolling(): Promise<boolean> {
    const dialog = await this.dialog().boundingBox();
    const button = await this.dialog().getByRole("button", {name: "Lock in arena"}).boundingBox();
    if (!dialog || !button) {
      return false;
    }

    return button.y >= dialog.y && button.y + button.height <= dialog.y + dialog.height;
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

  private opponentWeapon(slot: number): Locator {
    return this.dialog().getByTestId(`room-opponent-weapon-${slot}`);
  }

  private dialog(): Locator {
    return this.page.getByRole("dialog", {name: "Pre-round"});
  }
}
