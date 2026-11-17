import type {Input} from "@gunsmith/engine/game-loop/types/Input";

/** What two people ask for in one step: the first fighter (the world's `player`) and the second (its `opponent`). */
export interface FighterInputs {
  first: Input;
  second: Input;
}
