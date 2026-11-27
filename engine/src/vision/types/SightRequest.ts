import type {Point} from "@gunsmith/engine/geometry/types/Point";
import type {Eye} from "@gunsmith/engine/height/types/Eye";

/** A line of sight to judge: from a viewer at `from`, looking with `eye`, to the point `to`. */
export interface SightRequest {
  /** Where the viewer stands. */
  from: Point;
  /** The viewer's eye level and stance. */
  eye: Eye;
  /** The point looked at. */
  to: Point;
}
