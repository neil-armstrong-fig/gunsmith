import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {Bullet} from "@gunsmith/engine/bullet/types/Bullet";
import type {Dummy} from "@gunsmith/engine/dummy/types/Dummy";
import type {Match} from "@gunsmith/engine/match/types/Match";
import type {OpponentBrain} from "@gunsmith/engine/opponent/types/OpponentBrain";
import type {Player} from "@gunsmith/engine/player/types/Player";
import type {RoundState} from "@gunsmith/engine/round/types/RoundState";

/** Everything the simulation knows. A new one is returned from each step; none is ever changed in place. */
export interface World {
  arena: Arena;
  player: Player;
  /** The scripted opponent; absent in a world that has none, such as the practice range. */
  opponent?: Player | undefined;
  /** What the opponent remembers between steps. Absent when it has no brain: it then takes no action, a still target. */
  opponentBrain?: OpponentBrain | undefined;
  /** The shots in the air right now. */
  bullets: readonly Bullet[];
  /** The practice dummies still standing. A dummy with no health left is gone from the list. */
  dummies: readonly Dummy[];
  /** Game time since the round began, in seconds: a new round starts a new world, so it starts again from zero. */
  elapsedSeconds: number;
  /** Whether the round is still being fought. Once it is not, the world is frozen and only the clock runs. */
  round: RoundState;
  /** The best-of-three this round belongs to, scored as each round ends; absent in a world that is not one, such as the practice range. */
  match?: Match | undefined;
}
