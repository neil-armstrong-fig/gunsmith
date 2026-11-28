import type {PickedNothing} from "@gunsmith/engine/arena/picking/types/PickedNothing";
import type {PickedRandom} from "@gunsmith/engine/arena/picking/types/PickedRandom";
import type {PickedSeatArena} from "@src/durable-objects/match/pre-round/types/PickedSeatArena";

/** What a seat says when both arenas are shown to it: one of the two, random, or nothing (the engine's three choices, naming a seat). */
export type SeatPick = PickedSeatArena | PickedRandom | PickedNothing;
