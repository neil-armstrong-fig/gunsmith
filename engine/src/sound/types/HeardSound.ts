import type {HEARD_SOUNDS} from "@gunsmith/engine/sound/HeardSounds";

/** A kind of sound one fighter can hear the other make. */
export type HeardSound = (typeof HEARD_SOUNDS)[number];
