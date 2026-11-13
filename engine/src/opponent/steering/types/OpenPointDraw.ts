import type {Point} from "@gunsmith/engine/geometry/types/Point";

/** One look for an open place: the centre of an open tile, if one was found, and the seed to carry on with. */
export interface OpenPointDraw {
  point: Point | undefined;
  seed: number;
}
