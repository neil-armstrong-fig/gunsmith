import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {DIFFICULTY} from "@gunsmith/engine/opponent/Difficulty";
import {walkingDistanceTo} from "@gunsmith/engine/opponent/state/walking/WalkingDistanceTo";
import type {OpponentBrain} from "@gunsmith/engine/opponent/types/OpponentBrain";
import type {OpponentContext} from "@gunsmith/engine/opponent/types/OpponentContext";
import {radiusOfRing} from "@gunsmith/engine/ring/RadiusOfRing";

/**
 * Whether the opponent should be on its way to the weapon lying in the arena: it is, when it is nearer to it than the player
 * by more than `seekLead` tiles of walking (`walkingDistanceTo`, so a drop is gone round by its stair). One already on its
 * way keeps going until the player is nearer by more than `seekGrace`, so it does not turn back and forth at the edge. It
 * is never winning with no weapon lying there, when it cannot set out for it, or when the weapon lies beyond the closing ring's
 * safe ground (`ringMargin` inside its edge, as `shelterFromRing` keeps it): the shelter would hold it at the edge while it
 * did not fire, so it would stand idle for the rest of the round. A player whose walk cannot be measured
 * (a wall stands in the straight line, and the walk is a straight line with no map) is taken to be as near as the straight
 * line, which is the nearest they could be, so it never races a lead it cannot prove.
 */
export function winningTheRace(brain: OpponentBrain, context: OpponentContext): boolean {
  const {pickup} = context;
  if (!pickup) {
    return false;
  }

  const {arena, opponent, target, ring} = context;
  if (ring && distanceBetween(pickup.position, ring.centre) > radiusOfRing(ring) - DIFFICULTY.ringMargin) {
    return false;
  }

  const ownDistance = walkingDistanceTo(arena, opponent.position, pickup.position);
  if (ownDistance === undefined) {
    return false;
  }

  const playerDistance =
    walkingDistanceTo(arena, target.position, pickup.position) ??
    Math.hypot(pickup.position.x - target.position.x, pickup.position.y - target.position.y);
  if (brain.state === "seek") {
    return ownDistance <= playerDistance + DIFFICULTY.seekGrace;
  }

  return ownDistance + DIFFICULTY.seekLead < playerDistance;
}

function distanceBetween(from: Point, to: Point): number {
  return Math.hypot(to.x - from.x, to.y - from.y);
}
