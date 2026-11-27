import {distanceToCircle} from "@gunsmith/engine/bullet/flight/meeting/DistanceToCircle";
import type {DummyHit} from "@gunsmith/engine/bullet/flight/types/DummyHit";
import type {DummyHitRequest} from "@gunsmith/engine/bullet/flight/types/DummyHitRequest";
import {isShieldedByCover} from "@gunsmith/engine/cover/IsShieldedByCover";
import {DUMMY_RADIUS} from "@gunsmith/engine/dummy/DummyRadius";
import {eyeLevelAt} from "@gunsmith/engine/height/EyeLevelAt";

/**
 * The first dummy the bullet's next `distance` touches, or `undefined` when it touches none. A crouched dummy with a cover block
 * right beside it on the bullet's way is not touched, nor one on ground below the bullet's `floor`: the bullet passes over it,
 * and on to the next.
 */
export function nearestDummyHit(request: DummyHitRequest): DummyHit | undefined {
  const {arena, dummies, bullet, distance} = request;
  let nearest: DummyHit | undefined;

  dummies.forEach((dummy, dummyIndex) => {
    const reached = distanceToCircle(bullet, {centre: dummy.position, radius: DUMMY_RADIUS});
    if (reached === undefined || reached > distance) {
      return;
    }

    if (isShieldedByCover(arena, bullet.direction, dummy)) {
      return;
    }

    if (eyeLevelAt(arena, dummy.position) < bullet.floor) {
      return;
    }

    if (!nearest || reached < nearest.distance) {
      nearest = {dummyIndex, distance: reached};
    }
  });

  return nearest;
}
