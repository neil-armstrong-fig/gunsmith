import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";

/**
 * The cover hall's arena: a hall one tile wide and ten tiles long, with a low cover block at its third tile and its eighth (counting
 * from 0, tiles 2 and 7). A block is impassable, so each fighter has only the two tiles behind theirs (tiles 0 and 1, and 8 and 9) and
 * every shot along the row crosses both blocks. It is a fixture for a playtest and for specs, not an arena to play: one tile
 * high, it is under the size limits and its three stretches of floor are not joined, so it is not in the engine's built-in pool.
 */
export const COVER_HALL_ARENA = arenaFrom(["#".repeat(12), "#..c....c..#", "#".repeat(12)]);
