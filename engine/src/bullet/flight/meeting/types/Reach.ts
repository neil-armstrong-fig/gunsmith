import type {DummyHit} from "@gunsmith/engine/bullet/flight/types/DummyHit";

/** How far a bullet's next step carries it to each thing it could meet, along its path. */
export interface Reach {
  /** How far to the first wall; `Infinity` when the step meets none. */
  wallDistance: number;
  /** The nearest dummy the bullet could hurt, if the step reaches one. */
  dummyHit: DummyHit | undefined;
  /** How far to the fighter on the other side, if the step reaches one. */
  fighterDistance: number | undefined;
}
