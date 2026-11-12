import type {Player} from "@gunsmith/engine/player/types/Player";

/**
 * The player after asking for the weapon in `slot` (1 is the first). A reload in progress is cancelled, and the rounds in
 * both weapons stay as they were. Asking for the weapon already in hand, for nothing, or for a slot the player does not
 * carry changes nothing: the engine does not trust its input.
 */
export function switchWeapon(player: Player, slot: number | undefined): Player {
  if (slot === undefined) {
    return player;
  }

  const index = slot - 1;
  if (!Number.isInteger(index) || index < 0 || index >= player.loadout.length) {
    return player;
  }

  if (index === player.equippedIndex) {
    return player;
  }

  return {...player, equippedIndex: index, reloadRemainingSeconds: undefined};
}
