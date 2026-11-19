import type {Input} from "@gunsmith/engine/game-loop/types/Input";
import type {Seat} from "@gunsmith/engine/seat/types/Seat";

/** One thing that happens to a room: a seat's input reaches it, or the clock says some steps are owed. */
export type Step = {kind: "input"; seat: Seat; seq: number; input: Input} | {kind: "tick"; steps: number};
