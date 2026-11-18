import type {Input} from "@gunsmith/engine/game-loop/types/Input";

/** One ask and how many fixed steps it is held for without changing. */
export interface HeldAsk {
  input: Input;
  steps: number;
}
