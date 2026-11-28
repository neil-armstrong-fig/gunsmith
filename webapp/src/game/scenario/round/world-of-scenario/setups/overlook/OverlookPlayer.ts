import type {Point} from "@gunsmith/engine/geometry/types/Point";

/**
 * Where the player stands in the overlook (`TERRACED_ARENA`): on the low ground, at the west end, eleven tiles from the opponent, so
 * farther than its far range of eight and inside the rifle's reach of twelve, with a drop between them.
 */
export const OVERLOOK_PLAYER: Point = {x: 1.5, y: 3.5};
