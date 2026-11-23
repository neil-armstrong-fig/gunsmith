import type {WeaponWorkshopSetup} from "@src/dsl/gunsmith/components/workshop/types/WeaponWorkshopSetup";
import {fallbackAppearance} from "@gunsmith/shared/appearance/fallback/FallbackAppearance";
import {expect, type Page} from "@playwright/test";

const ID = "weapon-from-the-server";
const LEGACY_ID = "legacy-weapon-from-the-server";
const PROMPT = "a mint coil weapon";
const WEAPON = {
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
const LEGACY_WEAPON = {
  name: "Old Coil",
  bulletDamage: 25,
  fireIntervalSeconds: 0.2,
  bulletSpeed: 20,
  magazineSize: 12,
  reloadSeconds: 1.5,
  startingReserve: 36,
};
const appearance = fallbackAppearance();
const APPEARANCE = {...appearance, palette: {...appearance.palette, accent: "weapon-mint"}};

export async function arrangeSignedInWeapon(page: Page, setup: WeaponWorkshopSetup): Promise<() => void> {
  let saved = false;
  let legacySaved = setup === "full";
  let attempts = 0;
  let release: (() => void) | undefined;
  const pending = new Promise<void>(resolve => {
    release = resolve;
  });

  await page.route("**/api/me", async route => {
    await route.fulfill({json: {signedIn: true, displayName: "Weapon maker"}});
  });

  await page.route("**/api/weapons", async route => {
    expect(route.request().method()).toBe("POST");
    const ask: unknown = route.request().postDataJSON();
    attempts += 1;
    if (setup === "pending") await pending;

    if (isPrompt(ask, "a weapon with no credits")) {
      await route.fulfill({status: 402, json: {error: "no-credits"}});
      return;
    }
    if (isPrompt(ask, "a picnic blanket")) {
      await route.fulfill({json: {status: "rejected", reason: "Describe a weapon for the practice range."}});
      return;
    }
    if (isPrompt(ask, "a weapon with an unusable result")) {
      await route.fulfill({json: {status: "invalid", reason: "The weapon could not stay inside the game’s limits."}});
      return;
    }
    if (isPrompt(ask, "a mint coil that times out")) {
      if (attempts === 1) {
        await route.fulfill({status: 504, json: {error: "generation-timed-out"}});
        return;
      }
    } else {
      expect(ask).toEqual({prompt: PROMPT});
    }

    await route.fulfill({json: {status: "created", id: ID, weapon: WEAPON, appearance: APPEARANCE}});
  });

  await page.route(`**/api/library/${LEGACY_ID}`, async route => {
    expect(route.request().method()).toBe("DELETE");
    legacySaved = false;
    await route.fulfill({json: {status: "removed"}});
  });

  await page.route("**/api/library", async route => {
    if (route.request().method() === "POST") {
      expect(route.request().postDataJSON()).toEqual({id: ID});
      if (legacySaved) {
        await route.fulfill({status: 409, json: {error: "shelf-full", kind: "weapon", limit: 1}});
        return;
      }

      saved = true;
      await route.fulfill({json: {status: "saved"}});
      return;
    }

    expect(route.request().method()).toBe("GET");
    const weapons = [];
    if (legacySaved) {
      weapons.push({
        id: LEGACY_ID,
        prompt: "an old coil weapon",
        savedAt: "2026-11-20T12:00:00.000Z",
        weapon: LEGACY_WEAPON,
        appearance,
      });
    }
    if (saved) {
      weapons.push({
        id: ID,
        prompt: PROMPT,
        savedAt: "2026-11-22T12:00:00.000Z",
        weapon: WEAPON,
        appearance: APPEARANCE,
      });
    }

    let weaponLimit = 8;
    if (setup === "full") weaponLimit = 1;

    await route.fulfill({json: {limits: {weapons: weaponLimit, arenas: 3}, weapons, arenas: []}});
  });

  return () => {
    release?.();
  };
}

function isPrompt(ask: unknown, prompt: string): boolean {
  return typeof ask === "object" && ask !== null && "prompt" in ask && ask.prompt === prompt;
}
