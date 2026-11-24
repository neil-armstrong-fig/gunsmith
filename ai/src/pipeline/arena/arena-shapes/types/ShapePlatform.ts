import type {ShapeRectangle} from "@gunsmith/ai/pipeline/arena/arena-shapes/types/ShapeRectangle";

/** A rectangle of raised floor, one or two levels up. */
export interface ShapePlatform extends ShapeRectangle {
  level: 1 | 2;
}
