import type {ArenaSnapshot} from "@gunsmith/shared/state-hook/types/ArenaSnapshot";
import type {BulletSnapshot} from "@gunsmith/shared/state-hook/types/BulletSnapshot";
import type {DummySnapshot} from "@gunsmith/shared/state-hook/types/DummySnapshot";
import type {MatchSnapshot} from "@gunsmith/shared/state-hook/types/MatchSnapshot";
import type {OpponentSnapshot} from "@gunsmith/shared/state-hook/types/OpponentSnapshot";
import type {PlayerSnapshot} from "@gunsmith/shared/state-hook/types/PlayerSnapshot";
import type {RoundSnapshot} from "@gunsmith/shared/state-hook/types/RoundSnapshot";
import type {VisionSnapshot} from "@gunsmith/shared/state-hook/types/VisionSnapshot";
import type {WeaponSnapshot} from "@gunsmith/shared/state-hook/types/WeaponSnapshot";

/** What the state hook returns: a copy of the game as it is now, for an acceptance spec to read. */
export interface GameStateSnapshot {
  arena: ArenaSnapshot;
  player: PlayerSnapshot;
  /** The weapon in the player's hands. */
  weapon: WeaponSnapshot;
  /** The width and reach of what the player sees in detail; the weapon in hand sets them. */
  vision: VisionSnapshot;
  /** The scripted opponent; absent in a game that has none, such as the practice range. */
  opponent?: OpponentSnapshot | undefined;
  /** Whether the round is still being fought, or has been won or lost. */
  round: RoundSnapshot;
  /** The best-of-three this round belongs to; absent in a game that is not a match, such as the practice range or sparring. */
  match?: MatchSnapshot | undefined;
  /** The shots in the air right now. */
  bullets: BulletSnapshot[];
  /** The practice dummies still standing. */
  dummies: DummySnapshot[];
  /** Game time since the round began, in seconds; it starts again from zero with each round. Specs wait on this, never on the wall clock. */
  elapsedSeconds: number;
}
