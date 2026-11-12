import type {Input} from "@gunsmith/engine/game-loop/types/Input";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import {equippedWeapon} from "@gunsmith/engine/loadout/EquippedWeapon";
import {isBursting} from "@gunsmith/engine/opponent/burst/IsBursting";
import {hasClearLine} from "@gunsmith/engine/opponent/sight/HasClearLine";

/**
 * What the scripted opponent asks for this step, in the same shape as a player's input, so it is played by the same
 * rules. It stands where it is, always turns to face the player, holds the trigger in bursts while no wall is between
 * them, and reloads when its magazine is empty. It reads only the world and the clock, so the same world always gives
 * the same answer. With no opponent in the world it asks for nothing.
 */
export function opponentInput(world: World): Input {
  const {opponent, player, arena} = world;
  if (!opponent) {
    return {direction: {x: 0, y: 0}, firing: false, reload: false};
  }

  return {
    direction: {x: 0, y: 0},
    aimAt: player.position,
    firing: isBursting(world.elapsedSeconds) && hasClearLine(arena, opponent.position, player.position),
    reload: equippedWeapon(opponent).rounds === 0,
  };
}
