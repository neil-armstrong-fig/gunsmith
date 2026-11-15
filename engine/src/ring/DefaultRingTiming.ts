import type {RingTiming} from "@gunsmith/engine/ring/types/RingTiming";

/** The duel's ring: it starts after 45 seconds of the round and closes over the next 30. Tunables, to be set by play. */
export const DEFAULT_RING_TIMING: RingTiming = {startDelaySeconds: 45, closingSeconds: 30};
