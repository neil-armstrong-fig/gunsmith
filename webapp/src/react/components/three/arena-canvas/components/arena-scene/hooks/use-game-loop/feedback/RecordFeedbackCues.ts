import {cuesAfterTick} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/feedback/cues/CuesAfterTick";
import type {FeedbackReport} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/feedback/types/FeedbackReport";
import {useFeedbackStore} from "@src/store/feedback/UseFeedbackStore";

/**
 * Records the local player's damage and hits on visible targets after each local step or batch of room snapshots.
 * Writes only when a cue changes, including when the ring starts or stops hurting.
 */
export function recordFeedbackCues({events, round, hitPlaces}: FeedbackReport): void {
  const {bulletHits, ringHurting, hitMarks, setCues} = useFeedbackStore.getState();
  const previous = {bulletHits, ringHurting, hitMarks};
  const next = cuesAfterTick({previous, events, round, hitPlaces});

  if (next !== previous) {
    setCues(next);
  }
}
