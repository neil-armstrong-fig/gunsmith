import {shelfWeaponSchema} from "@src/store/shelf/browser-storage/shelf-weapons-from/shelf-weapon-schema/ShelfWeaponSchema";
import type {ShelfWeapon} from "@src/store/shelf/types/ShelfWeapon";

/**
 * The saved weapons in what the browser kept, which is `unknown` until `shelfWeaponSchema` has parsed it: an item that does not parse is left out (one bad item must
 * not cost the player the rest of the shelf), and so is a second item with an id already seen. What is left keeps its order. Anything that is not a list is an empty shelf.
 */
export function shelfWeaponsFrom(raw: unknown): ShelfWeapon[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  const weapons: ShelfWeapon[] = [];
  const seen = new Set<string>();
  for (const item of raw as unknown[]) {
    const parsed = shelfWeaponSchema.safeParse(item);
    if (parsed.success && !seen.has(parsed.data.id)) {
      seen.add(parsed.data.id);
      weapons.push(parsed.data);
    }
  }

  return weapons;
}
