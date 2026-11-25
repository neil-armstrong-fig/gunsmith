import type {ShapeRectangle} from "@gunsmith/ai/pipeline/arena/arena-shapes/types/ShapeRectangle";
import type {ShapesToDraw} from "@gunsmith/ai/pipeline/arena/arena-shapes/types/ShapesToDraw";

/** What is held to the arena's size: the shapes to draw, and the rectangles an edit clears first. */
export interface ShapesToCheck extends ShapesToDraw {
  clears?: readonly ShapeRectangle[] | undefined;
}
