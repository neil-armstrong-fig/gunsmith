import type {World} from "@gunsmith/engine/game-loop/types/World";

/**
 * Everything the game store holds: the engine's `World`, and the one way to replace it. Nothing else goes here. Menus,
 * lobby, library and credits belong in the app store, and a value worked out from the world is a selector, not state.
 */
export interface GameStore {
  /** The match as it stands. Replaced once per frame; never changed in place. */
  world: World;
  setWorld: (world: World) => void;
}
