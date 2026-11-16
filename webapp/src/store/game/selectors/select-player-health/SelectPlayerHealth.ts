import type {GameStore} from "@src/store/game/types/GameStore";

/**
 * The player's health in whole points, a part of a point rounded up so the screen never reads 0 while the player stands (the
 * ring takes health a fraction at a time). A plain number, so a component reads it as `useGameStore(selectPlayerHealth)` and
 * re-renders only when the number on the screen would change, not on every frame the ring takes a little.
 */
export function selectPlayerHealth(state: GameStore): number {
  return Math.ceil(state.world.player.health);
}
