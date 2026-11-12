import type {World} from "@gunsmith/engine/game-loop/types/World";
import type {GameStateSnapshot} from "@gunsmith/shared/state-hook/types/GameStateSnapshot";

/** A copy of the game as it stands, for the state hook. A copy, so nothing that reads it can change the game. */
export function snapshotOf(world: World): GameStateSnapshot {
  const {position, aim} = world.player;

  return {
    arena: {width: world.arena.width, height: world.arena.height},
    player: {x: position.x, y: position.y, aimDegrees: (Math.atan2(aim.y, aim.x) * 180) / Math.PI},
    bullets: world.bullets.map(bullet => ({x: bullet.position.x, y: bullet.position.y})),
    elapsedSeconds: world.elapsedSeconds,
  };
}
