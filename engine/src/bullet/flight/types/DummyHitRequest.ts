import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {Bullet} from "@gunsmith/engine/bullet/types/Bullet";
import type {Dummy} from "@gunsmith/engine/dummy/types/Dummy";

/** What `nearestDummyHit` is asked: which of these dummies the bullet's next `distance` touches first, in this arena (its cover shields a crouched dummy). */
export interface DummyHitRequest {
  arena: Arena;
  dummies: readonly Dummy[];
  bullet: Bullet;
  distance: number;
}
