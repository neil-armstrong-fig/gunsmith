import type {ItemKind} from "@src/shared/accounts/types/ItemKind";
import type {ShelfLimits} from "@src/shared/accounts/types/ShelfLimits";

/** How many places the shelf has for items of this kind. */
export function limitOfKind(limits: ShelfLimits, kind: ItemKind): number {
  if (kind === "weapon") {
    return limits.weapons;
  }

  return limits.arenas;
}
