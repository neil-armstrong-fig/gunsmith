import type {FeedbackCues} from "@src/store/feedback/types/FeedbackCues";

/**
 * Everything the feedback store holds: the cues of the damage the player takes, written by the game loop after every step
 * (so a hit in an earlier step of a frame is not lost, as it would be if the screen read the frame's last world) and read by
 * the health panel. Not the match, which is the game store's, and not a choice, which is the app store's.
 */
export interface FeedbackStore extends FeedbackCues {
  setCues: (cues: FeedbackCues) => void;
}
