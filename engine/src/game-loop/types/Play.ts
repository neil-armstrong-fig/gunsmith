import type {ChooseOpponent} from "@gunsmith/engine/game-loop/types/ChooseOpponent";
import type {Input} from "@gunsmith/engine/game-loop/types/Input";

/** What plays one step: the player's input, and how the opponent is chosen. */
export interface Play {
  input: Input;
  chooseOpponent: ChooseOpponent;
}
