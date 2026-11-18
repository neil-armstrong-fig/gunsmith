import {DUEL_BUILT_IN_ARENA} from "@gunsmith/engine/built-in-arenas/DuelBuiltInArena";
import {FAIR_DUEL_BUILT_IN_ARENA} from "@gunsmith/engine/built-in-arenas/FairDuelBuiltInArena";
import type {BuiltInArena} from "@gunsmith/engine/built-in-arenas/types/BuiltInArena";

/**
 * Every arena a player may pick by name, and the ones ai falls back to when a drawn arena cannot be used. Each is held to the same
 * checks as a drawn one (it reads, it is playable, it fits `ARENA_LIMITS`) and, because the fighters start on matching ground, it
 * is the same picture turned half way round. The scenario fixtures in the webapp (heights, practice, overwatch, terraced) are not
 * in the pool.
 */
export const BUILT_IN_ARENAS: readonly BuiltInArena[] = [DUEL_BUILT_IN_ARENA, FAIR_DUEL_BUILT_IN_ARENA];
