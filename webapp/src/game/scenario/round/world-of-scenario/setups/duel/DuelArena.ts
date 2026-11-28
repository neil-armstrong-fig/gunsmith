import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {DUEL_BUILT_IN_ARENA} from "@gunsmith/engine/arena/built-in/DuelBuiltInArena";

/** The arena for the duel: the engine's built-in "Duel" (its drawing and the places the fighters start are described there). */
export const DUEL_ARENA = arenaFrom(DUEL_BUILT_IN_ARENA.rows);
