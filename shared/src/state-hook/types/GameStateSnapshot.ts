import type {ArenaSnapshot} from "@gunsmith/shared/state-hook/types/ArenaSnapshot";
import type {BulletSnapshot} from "@gunsmith/shared/state-hook/types/BulletSnapshot";
import type {DummySnapshot} from "@gunsmith/shared/state-hook/types/DummySnapshot";
import type {PlayerSnapshot} from "@gunsmith/shared/state-hook/types/PlayerSnapshot";

/** What the state hook returns: a copy of the game as it is now, for an acceptance spec to read. */
export interface GameStateSnapshot {
  arena: ArenaSnapshot;
  player: PlayerSnapshot;
  /** The shots in the air right now. */
  bullets: BulletSnapshot[];
  /** The practice dummies still standing. */
  dummies: DummySnapshot[];
  /** Game time since the match began, in seconds. Specs wait on this, never on the wall clock. */
  elapsedSeconds: number;
}
