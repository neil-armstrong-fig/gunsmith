import type {PickedArena} from "@gunsmith/engine/arena-picking/types/PickedArena";
import type {PickedNothing} from "@gunsmith/engine/arena-picking/types/PickedNothing";
import type {PickedRandom} from "@gunsmith/engine/arena-picking/types/PickedRandom";

/** What a player may do when both arenas are shown: pick one, pick nothing, or leave it to chance. */
export type ArenaChoice = PickedArena | PickedRandom | PickedNothing;
