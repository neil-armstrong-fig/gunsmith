import type {Player} from "@gunsmith/engine/player/types/Player";

/**
 * The slot (1 is the first, as `Input.switchTo` counts) of another weapon the fighter carries that still has rounds in
 * its magazine or in its reserve, or `undefined` when no other weapon has. The weapon in hand is never named.
 */
export function otherLoadedSlot(fighter: Player): number | undefined {
  const index = fighter.loadout.findIndex(
    (carried, position) => position !== fighter.equippedIndex && (carried.rounds > 0 || carried.reserve > 0),
  );
  if (index === -1) {
    return undefined;
  }

  return index + 1;
}
