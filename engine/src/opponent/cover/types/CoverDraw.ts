import type {Point} from "@gunsmith/engine/geometry/types/Point";

/** One look for cover: the place found, if any, and the seed to carry on with. */
export interface CoverDraw {
  cover: Point | undefined;
  seed: number;
}
