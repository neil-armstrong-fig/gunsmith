import type {Point} from "@gunsmith/engine/geometry/types/Point";
import type {RingTiming} from "@gunsmith/engine/ring/types/RingTiming";

/**
 * The round's closing ring: a circle on a point chosen when the round began, covering the whole arena until it starts to
 * close and shrinking from then on, and hurting whoever stands outside it. Plain data: its clock is how much of the
 * round has been played, which runs while the round is being fought and stops when it is decided, and its radius and
 * damage are worked out from that clock, so a round can be replayed from its seed and inputs.
 */
export interface Ring {
  /** How many seconds of the round have been played. */
  roundSeconds: number;
  /** What the ring closes on. */
  centre: Point;
  /** How far from the centre the safe ground reaches before the ring starts to close: enough to cover the whole arena. */
  startRadius: number;
  timing: RingTiming;
}
