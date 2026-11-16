import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {Input} from "@gunsmith/engine/game-loop/types/Input";
import type {Player} from "@gunsmith/engine/player/types/Player";

export interface PrepareFighterRequest {
  arena: Arena;
  fighter: Player;
  input: Input;
  seconds: number;
}
