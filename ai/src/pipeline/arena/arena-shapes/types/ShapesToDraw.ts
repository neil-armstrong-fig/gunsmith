import type {ShapePlatform} from "@gunsmith/ai/pipeline/arena/arena-shapes/types/ShapePlatform";
import type {ShapeRectangle} from "@gunsmith/ai/pipeline/arena/arena-shapes/types/ShapeRectangle";
import type {ShapeStair} from "@gunsmith/ai/pipeline/arena/arena-shapes/types/ShapeStair";

/** What may be drawn onto a grid of floor: the lists every shapes format has, each left out when it has nothing. */
export interface ShapesToDraw {
  walls?: readonly ShapeRectangle[] | undefined;
  covers?: readonly ShapeRectangle[] | undefined;
  platforms?: readonly ShapePlatform[] | undefined;
  stairs?: readonly ShapeStair[] | undefined;
}
