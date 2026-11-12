import type {World} from "@gunsmith/engine/game-loop/types/World";
import {useGameStore} from "@src/store/game/UseGameStore";

/**
 * The world as it stands this instant, read without subscribing. This is how `useFrame` and the game loop look at the
 * match: the world changes every frame, so binding a component to it would render it 60 times a second.
 */
export function gameState(): World {
  return useGameStore.getState().world;
}
