import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import {distanceToWall} from "@gunsmith/engine/bullet/flight/DistanceToWall";
import {distanceToFighter} from "@gunsmith/engine/bullet/flight/meeting/DistanceToFighter";
import {firstContact} from "@gunsmith/engine/bullet/flight/meeting/FirstContact";
import {nearestDummyHit} from "@gunsmith/engine/bullet/flight/meeting/NearestDummyHit";
import {blocksSightFrom} from "@gunsmith/engine/height/BlocksSightFrom";
import type {Bullet} from "@gunsmith/engine/bullet/types/Bullet";
import type {DummyHit} from "@gunsmith/engine/bullet/flight/types/DummyHit";
import type {FlightRequest} from "@gunsmith/engine/bullet/types/FlightRequest";
import type {Meeting} from "@gunsmith/engine/bullet/types/Meeting";
import type {Point} from "@gunsmith/engine/geometry/types/Point";

/**
 * What the bullet runs into on this step, judged against the dummies and fighters as they stand in `flightRequest`. It stops at
 * a wall or at ground higher than the level it was fired from (it flies over lower ground), the same tiles that hide things from
 * the shooter's eye. A player's bullet can meet a dummy or the opponent, an opponent's bullet only the player, so a bullet never
 * meets its own side, and the opponent's pass through dummies.
 */
export function meetBullet(arena: Arena, flightRequest: FlightRequest, bullet: Bullet): Meeting {
  const distance = bullet.speed * flightRequest.seconds;
  const dummyHit = hittableDummyHit(flightRequest, bullet, distance);
  const contact = firstContact({
    wallDistance:
      distanceToWall(blocksSightFrom(arena, {eyeLevel: bullet.level, crouching: false}), bullet, distance) ?? Infinity,
    dummyHit,
    fighterDistance: distanceToFighter(fighterHurtBy(flightRequest, bullet), bullet, distance),
  });

  if (contact === "dummy") {
    return {bullet, contact, dummyIndex: dummyHit?.dummyIndex};
  }

  return {bullet, contact, dummyIndex: undefined};
}

/** The dummy this bullet could hurt next: only a player's bullet can. */
function hittableDummyHit(flightRequest: FlightRequest, bullet: Bullet, distance: number): DummyHit | undefined {
  if (bullet.shooter !== "player") {
    return undefined;
  }

  return nearestDummyHit(flightRequest.dummies, bullet, distance);
}

/** Where the fighter on the other side of this bullet stands, if there is one. */
function fighterHurtBy(flightRequest: FlightRequest, bullet: Bullet): Point | undefined {
  if (bullet.shooter === "player") {
    return flightRequest.opponentPosition;
  }

  return flightRequest.playerPosition;
}
