import type {Stance} from "@gunsmith/audio-studies/common/step-key/types/Stance";
import type {StanceVoicing} from "@gunsmith/audio-studies/generators/effects/steps/types/StanceVoicing";

/** How a footfall differs by stance: crouching is quieter and duller, the same surface muffled. */
export const STANCE_SHAPE: Readonly<Record<Stance, StanceVoicing>> = {
  stand: {cutoff: 1900, peak: 0.46},
  crouch: {cutoff: 640, peak: 0.15},
};
