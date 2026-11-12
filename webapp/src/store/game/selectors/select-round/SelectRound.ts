import type {RoundState} from "@gunsmith/engine/round/types/RoundState";
import type {GameStore} from "@src/store/game/types/GameStore";

/**
 * Where the round stands. A plain string, so a component reads it as `useGameStore(selectRound)` and re-renders only
 * when the round is won or lost, not on the frames in between.
 */
export function selectRound(state: GameStore): RoundState {
  return state.world.round;
}
