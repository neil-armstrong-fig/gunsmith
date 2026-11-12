import type {GameStore} from "@src/store/game/types/GameStore";

/**
 * The player's health. A plain number, so a component reads it as `useGameStore(selectPlayerHealth)` and re-renders only
 * when a hit lands, not on the frames in between.
 */
export function selectPlayerHealth(state: GameStore): number {
  return state.world.player.health;
}
