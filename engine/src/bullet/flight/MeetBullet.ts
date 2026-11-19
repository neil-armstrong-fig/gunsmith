import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import {isShieldedByCover} from "@gunsmith/engine/cover/IsShieldedByCover";
import {distanceToWall} from "@gunsmith/engine/bullet/flight/DistanceToWall";
import {distanceToFighter} from "@gunsmith/engine/bullet/flight/meeting/DistanceToFighter";
import {firstContact} from "@gunsmith/engine/bullet/flight/meeting/FirstContact";
import {nearestDummyHit} from "@gunsmith/engine/bullet/flight/meeting/NearestDummyHit";
import {blocksSightFrom} from "@gunsmith/engine/height/BlocksSightFrom";
import type {Bullet} from "@gunsmith/engine/bullet/types/Bullet";
import type {DummyHit} from "@gunsmith/engine/bullet/flight/types/DummyHit";
import type {DummyHitRequest} from "@gunsmith/engine/bullet/flight/types/DummyHitRequest";
import type {FlightRequest} from "@gunsmith/engine/bullet/types/FlightRequest";
import type {ShotTarget} from "@gunsmith/engine/cover/types/ShotTarget";
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
  const dummyHit = hittableDummyHit({arena, dummies: flightRequest.dummies, bullet, distance});
  const contact = firstContact({
    wallDistance:
      distanceToWall(blocksSightFrom(arena, {eyeLevel: bullet.level, crouching: bullet.crouching}), bullet, distance) ??
      Infinity,
    dummyHit,
    fighterDistance: distanceToFighter(fighterHurtBy(arena, flightRequest, bullet), bullet, distance),
  });

  if (contact === "dummy") {
    return {bullet, contact, dummyIndex: dummyHit?.dummyIndex};
  }

  return {bullet, contact, dummyIndex: undefined};
}

/** The dummy this bullet could hurt next: only a player's bullet can. */
function hittableDummyHit(request: DummyHitRequest): DummyHit | undefined {
  if (request.bullet.shooter !== "player") {
    return undefined;
  }

  return nearestDummyHit(request);
}

/** Where the fighter on the other side of this bullet stands, if there is one and the bullet is not passing over them. */
function fighterHurtBy(arena: Arena, flightRequest: FlightRequest, bullet: Bullet): Point | undefined {
  const fighter = fighterOnTheOtherSide(flightRequest, bullet);
  if (!fighter) {
    return undefined;
  }

  if (isShieldedByCover(arena, bullet.direction, fighter)) {
    return undefined;
  }

  return fighter.position;
}

function fighterOnTheOtherSide(flightRequest: FlightRequest, bullet: Bullet): ShotTarget | undefined {
  if (bullet.shooter === "player") {
    return placed(flightRequest.opponentPosition, flightRequest.opponentCrouching);
  }

  return placed(flightRequest.playerPosition, flightRequest.playerCrouching);
}

function placed(position: Point | undefined, crouching: boolean | undefined): ShotTarget | undefined {
  if (!position) {
    return undefined;
  }

  return {position, crouching};
}
