import type {Input} from "@gunsmith/engine/game-loop/types/Input";
import type {OpponentBrain} from "@gunsmith/engine/opponent/types/OpponentBrain";

/** What one state does with a step: what the opponent asks for, and the brain it carries on with. */
export interface StateAct {
  input: Input;
  brain: OpponentBrain;
}
