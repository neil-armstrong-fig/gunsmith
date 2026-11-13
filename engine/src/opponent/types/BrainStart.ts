import type {Point} from "@gunsmith/engine/geometry/types/Point";

/** What a new brain needs: the seed to draw its choices from, and where the opponent stands. */
export interface BrainStart {
  seed: number;
  position: Point;
}
