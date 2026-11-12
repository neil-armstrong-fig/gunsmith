import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import {bulletsStillFlying} from "@gunsmith/engine/bullet/flight/BulletsStillFlying";
import {meetBullet} from "@gunsmith/engine/bullet/flight/MeetBullet";
import {damageDealtBy} from "@gunsmith/engine/bullet/hit/DamageDealtBy";
import {strikesOf} from "@gunsmith/engine/bullet/hit/StrikesOf";
import type {BulletFlight} from "@gunsmith/engine/bullet/types/BulletFlight";
import type {FlightRequest} from "@gunsmith/engine/bullet/types/FlightRequest";
import {hurtDummies} from "@gunsmith/engine/dummy/HurtDummies";

/**
 * Flies every bullet on for `seconds`, each at its own speed. A bullet is gone when it touches a wall, a dummy or the
 * fighter on the other side, whichever it meets first (`meetBullet`). A player's bullet can hurt a dummy or the opponent;
 * an opponent's bullet can hurt the player; none hurts its own side, and the opponent's pass through dummies. A bullet that
 * meets a target and a wall in the same step hurts the target if the target was nearer. Every bullet is judged against the
 * dummies and fighters as they stood at the start of the step, so two bullets landing together both count. Returns the
 * bullets still in the air, the dummies still standing, and the damage that landed on each fighter.
 */
export function advanceBullets(arena: Arena, flightRequest: FlightRequest): BulletFlight {
  const meetings = flightRequest.bullets.map(bullet => meetBullet(arena, flightRequest, bullet));

  return {
    bullets: bulletsStillFlying(meetings, flightRequest.seconds),
    dummies: hurtDummies(flightRequest.dummies, strikesOf(meetings)),
    playerDamage: damageDealtBy(meetings, "opponent"),
    opponentDamage: damageDealtBy(meetings, "player"),
  };
}
