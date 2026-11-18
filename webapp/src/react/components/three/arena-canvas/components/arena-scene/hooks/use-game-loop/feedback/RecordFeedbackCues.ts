import {cuesAfterTick} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/feedback/cues/CuesAfterTick";
import {hitPlacesOfStep} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/feedback/hit-places/HitPlacesOfStep";
import type {StepReport} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/feedback/types/StepReport";
import {useFeedbackStore} from "@src/store/feedback/UseFeedbackStore";

/**
 * Tells the feedback store what one step did to the player and what the player's bullets did to a target they saw. The loop calls it after every step, not once a
 * frame, because a frame can run several and the game store keeps only the last world. It writes only when a cue changed, which is a hit, a hit landed, or the
 * ring starting or stopping, so nothing here wakes the screen every frame.
 */
export function recordFeedbackCues(report: StepReport): void {
  const {bulletHits, ringHurting, hitMarks, setCues} = useFeedbackStore.getState();
  const previous = {bulletHits, ringHurting, hitMarks};
  const {events, round} = report.after;
  const next = cuesAfterTick({previous, events, round, hitPlaces: hitPlacesOfStep(report)});

  if (next !== previous) {
    setCues(next);
  }
}
