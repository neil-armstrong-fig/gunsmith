import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {Bullet} from "@gunsmith/engine/bullet/types/Bullet";
import type {Player} from "@gunsmith/engine/player/types/Player";

/** Everything the simulation knows. A new one is returned from each step; none is ever changed in place. */
export interface World {
  arena: Arena;
  player: Player;
  /** The shots in the air right now. */
  bullets: readonly Bullet[];
  /** Game time since the match began, in seconds. */
  elapsedSeconds: number;
}
