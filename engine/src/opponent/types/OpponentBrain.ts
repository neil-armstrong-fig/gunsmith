import type {Point} from "@gunsmith/engine/geometry/types/Point";
import type {OpponentState} from "@gunsmith/engine/opponent/types/OpponentState";
import type {StrafeSide} from "@gunsmith/engine/opponent/types/StrafeSide";
import type {StuckWatch} from "@gunsmith/engine/opponent/types/StuckWatch";

/**
 * Everything the opponent remembers between steps. Plain data that lives in the `World`, so the same world always gives
 * the same next one and a match can be replayed. The random generator's state is the `seed`.
 */
export interface OpponentBrain {
  state: OpponentState;
  /** The state of the seeded generator the brain draws its choices from. */
  seed: number;
  /** How long the brain has been in this state. */
  secondsInState: number;
  /** The place it is walking to; absent when it has none. */
  goal?: Point | undefined;
  /** Where it last saw the player; absent until it has. */
  lastSeen?: Point | undefined;
  /** How long it has had the player in sight without a break; zero when it cannot see them. */
  seenSeconds: number;
  /** How long it still waits, after sighting the player, before opening fire. */
  reactionRemainingSeconds: number;
  /** How long the trigger stays down in the burst it is firing; zero between bursts. */
  fireRemainingSeconds: number;
  /** How long it still rests before the next burst. */
  restRemainingSeconds: number;
  /** This burst's aim error as a share of the widest error: from -1 to 1, drawn once per burst. */
  aimRoll: number;
  strafeSide: StrafeSide;
  /** How long until it changes the side it circles to. */
  strafeRemainingSeconds: number;
  /** How long it has stood at its goal. */
  idleSeconds: number;
  stuckWatch: StuckWatch;
}
