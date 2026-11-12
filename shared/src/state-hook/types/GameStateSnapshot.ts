import type {ArenaSnapshot} from "@gunsmith/shared/state-hook/types/ArenaSnapshot";
import type {BulletSnapshot} from "@gunsmith/shared/state-hook/types/BulletSnapshot";
import type {DummySnapshot} from "@gunsmith/shared/state-hook/types/DummySnapshot";
import type {OpponentSnapshot} from "@gunsmith/shared/state-hook/types/OpponentSnapshot";
import type {PlayerSnapshot} from "@gunsmith/shared/state-hook/types/PlayerSnapshot";
import type {RoundSnapshot} from "@gunsmith/shared/state-hook/types/RoundSnapshot";
import type {WeaponSnapshot} from "@gunsmith/shared/state-hook/types/WeaponSnapshot";

/** What the state hook returns: a copy of the game as it is now, for an acceptance spec to read. */
export interface GameStateSnapshot {
  arena: ArenaSnapshot;
  player: PlayerSnapshot;
  /** The weapon in the player's hands. */
  weapon: WeaponSnapshot;
  /** The scripted opponent; absent in a game that has none, such as the practice range. */
  opponent?: OpponentSnapshot | undefined;
  /** Whether the round is still being fought, or has been won or lost. */
  round: RoundSnapshot;
  /** The shots in the air right now. */
  bullets: BulletSnapshot[];
  /** The practice dummies still standing. */
  dummies: DummySnapshot[];
  /** Game time since the match began, in seconds. Specs wait on this, never on the wall clock. */
  elapsedSeconds: number;
}
