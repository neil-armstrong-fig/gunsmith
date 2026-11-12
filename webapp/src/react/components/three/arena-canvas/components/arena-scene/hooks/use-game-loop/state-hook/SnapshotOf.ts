import type {World} from "@gunsmith/engine/game-loop/types/World";
import {equippedWeapon} from "@gunsmith/engine/loadout/EquippedWeapon";
import type {GameStateSnapshot} from "@gunsmith/shared/state-hook/types/GameStateSnapshot";

/** A copy of the game as it stands, for the state hook. A copy, so nothing that reads it can change the game. */
export function snapshotOf(world: World): GameStateSnapshot {
  const {position, aim, equippedIndex, reloadRemainingSeconds} = world.player;
  const carried = equippedWeapon(world.player);

  return {
    arena: {width: world.arena.width, height: world.arena.height},
    player: {x: position.x, y: position.y, aimDegrees: (Math.atan2(aim.y, aim.x) * 180) / Math.PI},
    weapon: {
      slot: equippedIndex + 1,
      rounds: carried.rounds,
      reserve: carried.reserve,
      reloading: reloadRemainingSeconds !== undefined,
    },
    bullets: world.bullets.map(bullet => ({x: bullet.position.x, y: bullet.position.y})),
    dummies: world.dummies.map(dummy => ({x: dummy.position.x, y: dummy.position.y, health: dummy.health})),
    elapsedSeconds: world.elapsedSeconds,
  };
}
