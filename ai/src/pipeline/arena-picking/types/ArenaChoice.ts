import type {PickedArena} from "@gunsmith/ai/pipeline/arena-picking/types/PickedArena";
import type {PickedNothing} from "@gunsmith/ai/pipeline/arena-picking/types/PickedNothing";
import type {PickedRandom} from "@gunsmith/ai/pipeline/arena-picking/types/PickedRandom";

/** What a player may do when both arenas are shown: pick one, pick nothing, or leave it to chance. */
export type ArenaChoice = PickedArena | PickedRandom | PickedNothing;
