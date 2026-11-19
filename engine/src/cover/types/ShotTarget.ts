import type {Point} from "@gunsmith/engine/geometry/types/Point";

/** What a bullet may be shielded from: a fighter or a dummy, where it stands and whether it crouches (absent means standing). */
export interface ShotTarget {
  position: Point;
  crouching?: boolean | undefined;
}
