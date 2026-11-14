import type {Point} from "@gunsmith/engine/geometry/types/Point";

/** What a fighter sees in detail: a wedge from `apex` along `aim`, `halfAngleRadians` either side of it, out to `range`. */
export interface Cone {
  /** Where the wedge starts: the centre of the fighter. */
  apex: Point;
  /** The way the fighter faces, a vector of length one. */
  aim: Point;
  /** Half of the cone's width, in radians: how far from the aim a point can be and still be inside. */
  halfAngleRadians: number;
  /** How far the cone reaches, in tiles. */
  range: number;
  /** The level the fighter looks from: ground on a higher level hides what is on it and behind it, ground on their own level or lower does not. */
  eyeLevel: number;
}
