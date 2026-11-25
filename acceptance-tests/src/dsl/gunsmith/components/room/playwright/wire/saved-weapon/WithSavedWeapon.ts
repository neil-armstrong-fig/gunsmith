import {fallbackAppearance} from "@gunsmith/shared/appearance/fallback/FallbackAppearance";
import {isRevealFrame} from "@src/dsl/gunsmith/components/room/playwright/wire/IsRevealFrame";
import {isSnapshotFrame} from "@src/dsl/gunsmith/components/room/playwright/wire/IsSnapshotFrame";
import type {SavedWeaponHolder} from "@src/dsl/gunsmith/components/room/playwright/wire/saved-weapon/types/SavedWeaponHolder";

/** The name the saved weapon is shown by. */
const SAVED_NAME = "Mint Coil";

/** The key every saved weapon carries on the wire, whoever saved it. */
const SAVED_KEY = "saved";

/** The weapon a room puts in slot 1 when nothing else was locked in: the one the saved weapon stands in for. */
const REPLACED_KEY = "rifle";

const appearance = fallbackAppearance();

/** A saved weapon as the reveal names it: the rifle's numbers, so the server that plays the rifle agrees with it, and a drawing with a mint accent. */
const SAVED_WEAPON = {
  kind: "saved",
  weapon: {
    identity: {key: SAVED_KEY, name: SAVED_NAME},
    fireIntervalSeconds: 0.2,
    bulletDamage: 25,
    bulletSpeed: 20,
    magazineSize: 12,
    reloadSeconds: 1.5,
    startingReserve: 36,
    visionDegrees: 90,
    visionRange: 12,
  },
  appearance: {...appearance, palette: {...appearance.palette, accent: "weapon-mint"}},
};

/** Where the reveal lists each fighter's weapons. */
const REVEAL_SIDES: Record<SavedWeaponHolder, string> = {player: "own", opponent: "opponent"};

/**
 * `frame` as the server would have written it had `holder` locked in a saved weapon for slot 1. The local Worker sees no session, so it
 * refuses saved ids; this stands in for a signed-in seat. The reveal names the saved weapon with its drawing, and each snapshot gives
 * `holder`'s slot-1 rifle the saved weapon's key and name, keeping the server's numbers. Any other frame is handed on unchanged, and so
 * is a slot 1 that holds something else (a weapon picked up).
 */
export function withSavedWeapon(frame: string, holder: SavedWeaponHolder): string {
  if (isRevealFrame(frame)) {
    return revealWithSavedWeapon(frame, holder);
  }

  if (isSnapshotFrame(frame)) {
    return snapshotWithSavedWeapon(frame, holder);
  }

  return frame;
}

function revealWithSavedWeapon(frame: string, holder: SavedWeaponHolder): string {
  const reveal: unknown = JSON.parse(frame);
  const weapons = fieldOf(fieldOf(reveal, "weapons"), REVEAL_SIDES[holder]);
  if (!Array.isArray(weapons)) {
    return frame;
  }

  weapons[0] = SAVED_WEAPON;

  return JSON.stringify(reveal);
}

function snapshotWithSavedWeapon(frame: string, holder: SavedWeaponHolder): string {
  const snapshot: unknown = JSON.parse(frame);
  const loadout = fieldOf(fieldOf(snapshot, holder), "loadout");
  const weapon = Array.isArray(loadout) ? fieldOf(loadout[0], "weapon") : undefined;
  if (fieldOf(fieldOf(weapon, "identity"), "key") !== REPLACED_KEY) {
    return frame;
  }

  Reflect.set(Object(weapon), "identity", {key: SAVED_KEY, name: SAVED_NAME});

  return JSON.stringify(snapshot);
}

function fieldOf(value: unknown, name: string): unknown {
  if (typeof value !== "object" || value === null) {
    return undefined;
  }

  return Reflect.get(value, name);
}
