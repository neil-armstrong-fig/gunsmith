import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import type {RingTiming} from "@gunsmith/engine/ring/types/RingTiming";

/** What a round's ring is made from: the arena, where the fighters start, the seed that picks the centre and the timing. */
export interface RingRequest {
  arena: Arena;
  /** Where each fighter begins; the ring closes on ground every one of them can walk to. */
  starts: readonly Point[];
  seed: number;
  timing: RingTiming;
}
