import {cuesAfterTick} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/feedback/cues/CuesAfterTick";
import type {StepReport} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/feedback/cues/types/StepReport";
import {useFeedbackStore} from "@src/store/feedback/UseFeedbackStore";

/**
 * Tells the feedback store what one step did to the player. The loop calls it after every step, not once a frame, because a
 * frame can run several and the game store keeps only the last world. It writes only when a cue changed, which is a hit or
 * the ring starting or stopping, so nothing here wakes the screen every frame.
 */
export function recordFeedbackCues({events, round}: StepReport): void {
  const {bulletHits, ringHurting, setCues} = useFeedbackStore.getState();
  const previous = {bulletHits, ringHurting};
  const next = cuesAfterTick({previous, events, round});

  if (next !== previous) {
    setCues(next);
  }
}
