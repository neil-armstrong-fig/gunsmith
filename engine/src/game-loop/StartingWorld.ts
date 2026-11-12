import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {World} from "@gunsmith/engine/game-loop/types/World";

/** A match about to begin: the player in the middle of the arena's centre tile, facing east, with the weapon ready. */
export function startingWorld(arena: Arena): World {
  return {
    arena,
    player: {
      position: {x: Math.floor(arena.width / 2) + 0.5, y: Math.floor(arena.height / 2) + 0.5},
      aim: {x: 1, y: 0},
      cooldownSeconds: 0,
    },
    bullets: [],
    elapsedSeconds: 0,
  };
}
