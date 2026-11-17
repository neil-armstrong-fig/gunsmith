import type {StepReport} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/feedback/cues/types/StepReport";
import type {FeedbackCues} from "@src/store/feedback/types/FeedbackCues";

/** What `cuesAfterTick` is told about one step: what it reported, and the cues as the step before left them. */
export interface CuesRequest extends StepReport {
  previous: FeedbackCues;
}
