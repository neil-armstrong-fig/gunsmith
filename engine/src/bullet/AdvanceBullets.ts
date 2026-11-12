import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import {BULLET_SPEED} from "@gunsmith/engine/bullet/flight/BulletSpeed";
import {distanceToWall} from "@gunsmith/engine/bullet/flight/DistanceToWall";
import {nearestDummyHit} from "@gunsmith/engine/bullet/hit/NearestDummyHit";
import type {Bullet} from "@gunsmith/engine/bullet/types/Bullet";
import type {BulletFlight} from "@gunsmith/engine/bullet/types/BulletFlight";
import type {FlightRequest} from "@gunsmith/engine/bullet/types/FlightRequest";
import {hurtDummies} from "@gunsmith/engine/dummy/HurtDummies";
import {BULLET_DAMAGE} from "@gunsmith/engine/weapon/damage/BulletDamage";

/**
 * Flies every bullet on for `seconds`. A bullet is gone when it touches a wall or a dummy, whichever it meets first, and
 * a dummy it touches is hurt. A bullet that meets a dummy and a wall in the same step hurts the dummy if the dummy was
 * nearer. Every bullet is judged against the dummies as they stood at the start of the step, so two bullets landing
 * together both count. Returns the bullets still in the air and the dummies still standing.
 */
export function advanceBullets(arena: Arena, flightRequest: FlightRequest): BulletFlight {
  const {bullets, dummies, seconds} = flightRequest;
  const distance = BULLET_SPEED * seconds;
  const flying: Bullet[] = [];
  const hits: number[] = [];

  for (const bullet of bullets) {
    const wallDistance = distanceToWall(arena, bullet, distance);
    const dummyHit = nearestDummyHit(dummies, bullet, distance);

    if (dummyHit && (wallDistance === undefined || dummyHit.distance < wallDistance)) {
      hits.push(dummyHit.dummyIndex);
    } else if (wallDistance === undefined) {
      flying.push(movedOn(bullet, distance));
    }
  }

  return {bullets: flying, dummies: hurtDummies(dummies, hits, BULLET_DAMAGE)};
}

function movedOn(bullet: Bullet, distance: number): Bullet {
  return {
    position: {
      x: bullet.position.x + bullet.direction.x * distance,
      y: bullet.position.y + bullet.direction.y * distance,
    },
    direction: bullet.direction,
  };
}
