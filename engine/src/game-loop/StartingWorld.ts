import {DUMMY_HEALTH} from "@gunsmith/engine/dummy/DummyHealth";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import {STARTING_LOADOUT} from "@gunsmith/engine/loadout/StartingLoadout";

/**
 * A match about to begin: the player in the middle of the arena's centre tile, facing east, with the rifle in hand and
 * both weapons full, and a dummy at full health at each of `dummyPositions`.
 */
export function startingWorld(arena: Arena, dummyPositions: readonly Point[] = []): World {
  return {
    arena,
    player: {
      position: {x: Math.floor(arena.width / 2) + 0.5, y: Math.floor(arena.height / 2) + 0.5},
      aim: {x: 1, y: 0},
      cooldownSeconds: 0,
      loadout: STARTING_LOADOUT,
      equippedIndex: 0,
    },
    bullets: [],
    dummies: dummyPositions.map(position => ({position, health: DUMMY_HEALTH})),
    elapsedSeconds: 0,
  };
}
