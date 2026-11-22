import type {Page} from "@playwright/test";
import {expect} from "@playwright/test";
import {addressOfPracticeRange} from "@src/dsl/gunsmith/components/room/components/front-door/playwright/address/AddressOfPracticeRange";
import type {RoomLimits} from "@src/dsl/gunsmith/components/room/types/RoomLimits";
import {BasePage} from "@src/dsl/gunsmith/playwright/BasePage";

export class FrontDoorPlaywright extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /** Opens the practice range with `limits` on its address, which the front door passes on to the room it makes or joins. */
  async openThePracticeRange(limits: RoomLimits = {}): Promise<void> {
    await this.page.goto(addressOfPracticeRange(limits));
    const arena = this.page.getByTestId("arena");
    await expect(arena).toHaveAttribute("data-ready", "true");
    await expect(arena).toHaveAttribute("data-sprites-ready", "true");
  }

  async hasMakeARoom(): Promise<boolean> {
    return await this.page.getByRole("button", {name: "Make a room"}).isVisible();
  }

  async hasJoinARoom(): Promise<boolean> {
    const box = this.page.getByRole("textbox", {name: "Friend code"});
    const button = this.page.getByRole("button", {name: "Join a room"});

    return (await box.isVisible()) && (await button.isVisible());
  }

  /** Presses Make a room and waits until the page is in the room the server made. Returns its friend code. */
  async makeARoom(): Promise<string> {
    await this.tryToMakeARoom();
    await expect(this.page).toHaveURL(/[?&]room=/);

    const code = this.friendCode();
    if (!code) {
      throw new Error("The page is in a room that has no friend code.");
    }

    return code;
  }

  /** Presses Make a room, whatever comes of it. */
  async tryToMakeARoom(): Promise<void> {
    await this.page.getByRole("button", {name: "Make a room"}).click();
  }

  /** Types `text` into the friend code box key by key, as a person types, so every key the game listens for is pressed as well. */
  async typeTheCode(text: string): Promise<void> {
    await this.page.getByRole("textbox", {name: "Friend code"}).pressSequentially(text);
  }

  /** Types `code` into the friend code box and presses Join a room. */
  async joinARoom(code: string): Promise<void> {
    await this.page.getByRole("textbox", {name: "Friend code"}).fill(code);
    await this.page.getByRole("button", {name: "Join a room"}).click();
  }

  /** Answers every request for a new room with a server error, as an API that is down would. */
  async turnAwayNewRooms(): Promise<void> {
    await this.page.route(
      url => url.pathname === "/api/rooms",
      route => route.fulfill({status: 500, json: {error: "unavailable"}}),
    );
  }

  /** The friend code of the room the page is in, or nothing on the practice range. */
  getFriendCode(): string | undefined {
    return this.friendCode();
  }

  /** What the front door says is wrong, once it says so. */
  async getMessage(): Promise<string> {
    const message = this.page.getByRole("alert");
    await expect(message).toBeVisible();

    return await message.innerText();
  }

  private friendCode(): string | undefined {
    return new URL(this.page.url()).searchParams.get("room") ?? undefined;
  }
}
