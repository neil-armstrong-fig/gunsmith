import type {LibraryContents} from "@src/dsl/gunsmith/components/room/components/pre-round/types/LibraryContents";
import type {SavedItemIds} from "@src/dsl/gunsmith/components/room/components/pre-round/types/SavedItemIds";
import {fallbackAppearance} from "@gunsmith/shared/appearance/fallback/FallbackAppearance";
import type {Page} from "@playwright/test";

const FIRST_WEAPON = {
  name: "Mint Coil",
  bulletDamage: 25,
  fireIntervalSeconds: 0.2,
  bulletSpeed: 20,
  magazineSize: 12,
  reloadSeconds: 1.5,
  startingReserve: 36,
  visionDegrees: 110,
  visionRange: 15,
};
const SECOND_WEAPON = {
  name: "Ember Lance",
  bulletDamage: 40,
  fireIntervalSeconds: 0.6,
  bulletSpeed: 30,
  magazineSize: 5,
  reloadSeconds: 2.2,
  startingReserve: 15,
  visionDegrees: 70,
  visionRange: 18,
};
const ARENA = {
  name: "Foundry",
  rows: [
    "############",
    "#..........#",
    "#..........#",
    "#...##.....#",
    "#..........#",
    "#.....##...#",
    "#..........#",
    "#..........#",
    "############",
  ],
};

const FIRST_WEAPON_ID = "first-weapon-from-the-library";
const SECOND_WEAPON_ID = "second-weapon-from-the-library";
const SAVED_ARENA_ID = "arena-from-the-library";

/**
 * Makes the page's account the signed-in player's: it is told who they are and, when it asks, what their library holds. The room's server still
 * sees no session, so it refuses the saved ids; what a spec reads is what the page offered and sent. Answers the ids the library gives its items.
 */
export async function arrangeSignedInPlayer(page: Page, library: LibraryContents): Promise<SavedItemIds> {
  await page.route("**/api/me", async route => {
    await route.fulfill({json: {signedIn: true, displayName: "Room player"}});
  });

  await page.route("**/api/library", async route => {
    const saved = library === "two saved weapons and an arena";
    const weapons = [];
    const arenas = [];
    if (saved) {
      weapons.push(
        {
          id: FIRST_WEAPON_ID,
          prompt: "a mint coil weapon",
          savedAt: "2026-11-22T12:00:00.000Z",
          weapon: FIRST_WEAPON,
          appearance: fallbackAppearance(),
        },
        {
          id: SECOND_WEAPON_ID,
          prompt: "a slow heavy lance",
          savedAt: "2026-11-22T13:00:00.000Z",
          weapon: SECOND_WEAPON,
          appearance: fallbackAppearance(),
        },
      );
      arenas.push({
        id: SAVED_ARENA_ID,
        prompt: "a wide industrial yard",
        savedAt: "2026-11-20T12:00:00.000Z",
        arena: ARENA,
      });
    }

    await route.fulfill({json: {limits: {weapons: 8, arenas: 3}, weapons, arenas}});
  });

  return {firstWeaponId: FIRST_WEAPON_ID, secondWeaponId: SECOND_WEAPON_ID, arenaId: SAVED_ARENA_ID};
}
