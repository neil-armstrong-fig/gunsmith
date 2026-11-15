import {secondsUntilRing} from "@gunsmith/engine/ring/SecondsUntilRing";
import type {GameStore} from "@src/store/game/types/GameStore";

/**
 * The whole seconds left before the ring starts to close, rounded up so that the countdown never reads 0 before the ring
 * has started, or nothing when the game has no ring. It changes once a second, not once a frame, so a component reads it
 * as `useGameStore(selectSecondsUntilRing)` and re-renders only when the number on the screen would change.
 */
export function selectSecondsUntilRing(state: GameStore): number | undefined {
  const {ring} = state.world;
  if (!ring) {
    return undefined;
  }

  return Math.ceil(secondsUntilRing(ring));
}
