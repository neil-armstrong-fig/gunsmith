import type {PickedNothing} from "@src/online/types/pre-round/PickedNothing";
import type {PickedRandom} from "@src/online/types/pre-round/PickedRandom";
import type {PickedSeatArena} from "@src/online/types/pre-round/PickedSeatArena";

/** What a seat says when both arenas are shown to it: one of the two, random, or nothing. */
export type SeatPick = PickedSeatArena | PickedRandom | PickedNothing;
