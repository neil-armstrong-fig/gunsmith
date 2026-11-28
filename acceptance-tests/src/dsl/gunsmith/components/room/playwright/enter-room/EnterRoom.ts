import type {Page} from "@playwright/test";
import {expect} from "@playwright/test";
import {addressOfRoom} from "@src/dsl/gunsmith/components/room/playwright/enter-room/address/AddressOfRoom";
import type {RoomLimits} from "@src/dsl/gunsmith/components/room/types/RoomLimits";

/** Opens the room's page in `page`, asking for `limits` if it is the room's first, and waits until its arena is drawn into, as the game's own pages are waited for. */
export async function enterRoom(page: Page, code: string, limits: RoomLimits = {}): Promise<void> {
  await page.goto(addressOfRoom(code, limits));

  const arena = page.getByTestId("arena");
  await expect(arena).toHaveAttribute("data-ready", "true");
  await expect(arena).toHaveAttribute("data-sprites-ready", "true");
}
