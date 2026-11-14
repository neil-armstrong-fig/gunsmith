import {distanceToCircle} from "@gunsmith/engine/bullet/flight/meeting/DistanceToCircle";
import type {Bullet} from "@gunsmith/engine/bullet/types/Bullet";
import type {DummyHit} from "@gunsmith/engine/bullet/flight/types/DummyHit";
import {DUMMY_RADIUS} from "@gunsmith/engine/dummy/DummyRadius";
import type {Dummy} from "@gunsmith/engine/dummy/types/Dummy";

/** The first dummy the bullet's next `distance` touches, or `undefined` when it touches none. */
export function nearestDummyHit(dummies: readonly Dummy[], bullet: Bullet, distance: number): DummyHit | undefined {
  let nearest: DummyHit | undefined;

  dummies.forEach((dummy, dummyIndex) => {
    const reached = distanceToCircle(bullet, {centre: dummy.position, radius: DUMMY_RADIUS});
    if (reached === undefined || reached > distance) {
      return;
    }

    if (!nearest || reached < nearest.distance) {
      nearest = {dummyIndex, distance: reached};
    }
  });

  return nearest;
}
