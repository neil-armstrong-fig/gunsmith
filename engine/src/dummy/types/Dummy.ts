import type {Point} from "@gunsmith/engine/geometry/types/Point";

/** A practice target: it stands still, takes hits, and is gone when its health runs out. */
export interface Dummy {
  /** The centre of the dummy's circle. */
  position: Point;
  /** What is left; a dummy at zero or below is removed from the world. */
  health: number;
  /** Whether it crouches, which a cover block right beside it hides it for. It never changes: a dummy stands still. Absent means standing. */
  crouching?: boolean | undefined;
}
