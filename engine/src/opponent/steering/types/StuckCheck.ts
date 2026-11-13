import type {StuckWatch} from "@gunsmith/engine/opponent/types/StuckWatch";

/** The watch to carry into the next step, and whether the opponent has been walking without getting anywhere. */
export interface StuckCheck {
  watch: StuckWatch;
  stuck: boolean;
}
