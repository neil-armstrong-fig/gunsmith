import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {Input} from "@gunsmith/engine/game-loop/types/Input";
import type {Player} from "@gunsmith/engine/player/types/Player";

/** A fighter and the inputs to play on them, one per fixed step, oldest first. */
export interface ReplayRequest {
  arena: Arena;
  player: Player;
  inputs: readonly Input[];
}
