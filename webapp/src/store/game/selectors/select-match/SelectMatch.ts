import type {Match} from "@gunsmith/engine/match/types/Match";
import type {GameStore} from "@src/store/game/types/GameStore";

/**
 * The match the world belongs to, or nothing when it is not one. A step hands on the very same match until a round is
 * scored, so a component reads it as `useGameStore(selectMatch)` and re-renders only when the score or the round moves,
 * not on the frames in between.
 */
export function selectMatch(state: GameStore): Match | undefined {
  return state.world.match;
}
