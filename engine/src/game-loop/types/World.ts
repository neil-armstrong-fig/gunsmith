import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {Bullet} from "@gunsmith/engine/bullet/types/Bullet";
import type {Dummy} from "@gunsmith/engine/dummy/types/Dummy";
import type {Player} from "@gunsmith/engine/player/types/Player";
import type {RoundState} from "@gunsmith/engine/round/types/RoundState";

/** Everything the simulation knows. A new one is returned from each step; none is ever changed in place. */
export interface World {
  arena: Arena;
  player: Player;
  /** The scripted opponent; absent in a world that has none, such as the practice range. */
  opponent?: Player | undefined;
  /** The shots in the air right now. */
  bullets: readonly Bullet[];
  /** The practice dummies still standing. A dummy with no health left is gone from the list. */
  dummies: readonly Dummy[];
  /** Game time since the match began, in seconds. */
  elapsedSeconds: number;
  /** Whether the round is still being fought. Once it is not, the world is frozen and only the clock runs. */
  round: RoundState;
}
