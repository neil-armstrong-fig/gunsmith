import type {Input} from "@gunsmith/engine/game-loop/types/Input";
import type {OpponentBrain} from "@gunsmith/engine/opponent/types/OpponentBrain";

/** What the opponent asks for this step, and the brain it carries into the next one (absent when it has none). */
export interface OpponentDecision {
  input: Input;
  brain: OpponentBrain | undefined;
}
