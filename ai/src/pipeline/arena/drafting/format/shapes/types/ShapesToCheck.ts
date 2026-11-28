import type {ShapeRectangle} from "@gunsmith/ai/pipeline/arena/drafting/format/shapes/types/ShapeRectangle";
import type {ShapesToDraw} from "@gunsmith/ai/pipeline/arena/drafting/format/shapes/types/ShapesToDraw";

/** What is held to the arena's size: the shapes to draw, the rectangles an edit clears first, and the floor outline's open rectangles. */
export interface ShapesToCheck extends ShapesToDraw {
  clears?: readonly ShapeRectangle[] | undefined;
  floor?: readonly ShapeRectangle[] | undefined;
}
