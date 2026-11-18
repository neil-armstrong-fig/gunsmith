import type {Point} from "@gunsmith/engine/geometry/types/Point";
import type {Eye} from "@gunsmith/engine/height/types/Eye";

/** What a fighter sees in detail: a wedge from `apex` along `aim`, `halfAngleRadians` either side of it, out to `range`, from the eye level and stance of the fighter. */
export interface Cone extends Eye {
  /** Where the wedge starts: the centre of the fighter. */
  apex: Point;
  /** The way the fighter faces, a vector of length one. */
  aim: Point;
  /** Half of the cone's width, in radians: how far from the aim a point can be and still be inside. */
  halfAngleRadians: number;
  /** How far the cone reaches, in tiles. */
  range: number;
}
