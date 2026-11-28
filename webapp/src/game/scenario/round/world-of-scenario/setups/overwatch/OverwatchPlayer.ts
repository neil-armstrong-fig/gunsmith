import type {Point} from "@gunsmith/engine/geometry/types/Point";

/**
 * Where the player stands in the overwatch (`OVERWATCH_ARENA`): on the platform at its edge (its face is at x = 38), where a shot
 * can reach the low ground, in the corridor's row, inside the rifle's reach of the opponent.
 */
export const OVERWATCH_PLAYER: Point = {x: 38.5, y: 1.5};
