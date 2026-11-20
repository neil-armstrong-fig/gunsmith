import type {LOUDNESSES} from "@gunsmith/engine/sound/Loudnesses";

/** How loud a heard sound is: near, mid or far, which says roughly how far off it is and no more. */
export type Loudness = (typeof LOUDNESSES)[number];
