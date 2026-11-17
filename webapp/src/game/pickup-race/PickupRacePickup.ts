import type {Point} from "@gunsmith/engine/geometry/types/Point";

/**
 * Where the weapon lies in the pickup race (`DUEL_ARENA`): four tiles south of the opponent and eight from the player, so the
 * opponent is the one who wins the walk to it.
 */
export const PICKUP_RACE_PICKUP: Point = {x: 17.5, y: 10.5};
