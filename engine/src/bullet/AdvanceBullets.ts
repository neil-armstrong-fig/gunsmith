import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import {distanceToWall} from "@gunsmith/engine/bullet/flight/DistanceToWall";
import {nearestDummyHit} from "@gunsmith/engine/bullet/hit/NearestDummyHit";
import type {Bullet} from "@gunsmith/engine/bullet/types/Bullet";
import type {BulletFlight} from "@gunsmith/engine/bullet/types/BulletFlight";
import type {FlightRequest} from "@gunsmith/engine/bullet/types/FlightRequest";
import {hurtDummies} from "@gunsmith/engine/dummy/HurtDummies";
import type {Strike} from "@gunsmith/engine/dummy/types/Strike";

/**
 * Flies every bullet on for `seconds`, each at its own speed. A bullet is gone when it touches a wall or a dummy,
 * whichever it meets first, and a dummy it touches is hurt by that bullet's own damage. A bullet that meets a dummy and a wall in the same step hurts the dummy if the dummy was
 * nearer. Every bullet is judged against the dummies as they stood at the start of the step, so two bullets landing
 * together both count. Returns the bullets still in the air and the dummies still standing.
 */
export function advanceBullets(arena: Arena, flightRequest: FlightRequest): BulletFlight {
  const {bullets, dummies, seconds} = flightRequest;
  const flying: Bullet[] = [];
  const strikes: Strike[] = [];

  for (const bullet of bullets) {
    const distance = bullet.speed * seconds;
    const wallDistance = distanceToWall(arena, bullet, distance);
    const dummyHit = nearestDummyHit(dummies, bullet, distance);

    if (dummyHit && (wallDistance === undefined || dummyHit.distance < wallDistance)) {
      strikes.push({dummyIndex: dummyHit.dummyIndex, damage: bullet.damage});
    } else if (wallDistance === undefined) {
      flying.push(movedOn(bullet, distance));
    }
  }

  return {bullets: flying, dummies: hurtDummies(dummies, strikes)};
}

function movedOn(bullet: Bullet, distance: number): Bullet {
  return {
    ...bullet,
    position: {
      x: bullet.position.x + bullet.direction.x * distance,
      y: bullet.position.y + bullet.direction.y * distance,
    },
  };
}
