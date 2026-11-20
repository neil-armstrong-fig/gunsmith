import {shelfWeaponsFrom} from "@src/store/shelf/browser-storage/shelf-weapons-from/ShelfWeaponsFrom";
import type {ShelfWeapon} from "@src/store/shelf/types/ShelfWeapon";
import {z} from "zod";

const persistedShelfSchema = z.object({weapons: z.unknown()});

/**
 * The saved weapons in what zustand's `persist` read back from the browser, which it hands over as `unknown` and does not check: whatever was kept is parsed here, weapon by
 * weapon, so a kept shelf that is damaged in part still gives its good weapons, and one that is not a shelf at all gives an empty one.
 */
export function shelfWeaponsOfPersisted(persisted: unknown): ShelfWeapon[] {
  const parsed = persistedShelfSchema.safeParse(persisted);
  if (!parsed.success) {
    return [];
  }

  return shelfWeaponsFrom(parsed.data.weapons);
}
