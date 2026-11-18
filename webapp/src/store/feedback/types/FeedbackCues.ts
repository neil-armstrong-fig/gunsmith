import type {HitMark} from "@src/store/feedback/types/HitMark";

/** What the screen is told about the fight: the damage the player takes, and the hits they land on targets they see. */
export interface FeedbackCues {
  /** How many steps a bullet has hurt the player in, since the page opened. It only rises: a flash restarts on each change. */
  bulletHits: number;
  /** Whether the ring hurt the player in the latest step of a round being fought. */
  ringHurting: boolean;
  /** The latest places the player's bullets hit a target they saw, oldest first (a few: the screen takes each new one once). The engine gives no place, so these are found by `hitPlacesOfStep`. */
  hitMarks: readonly HitMark[];
}
