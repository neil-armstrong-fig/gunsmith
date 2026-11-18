import type {Seat} from "@gunsmith/engine/seat/types/Seat";

/** One thing that happens to a room's people: a seat's person leaves, comes back, asks to go on or asks for something new, or time passes. */
export type Coming =
  | {kind: "leave"; seat: Seat}
  | {kind: "return"; seat: Seat}
  | {kind: "ready"; seat: Seat}
  | {kind: "ask"; seat: Seat; walking: boolean}
  | {kind: "wait"; seconds: number};
