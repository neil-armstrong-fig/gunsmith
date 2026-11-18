import type {World} from "@gunsmith/engine/game-loop/types/World";
import {canSeeFighter} from "@gunsmith/engine/vision/sight/CanSeeFighter";
import {canSeePoint} from "@gunsmith/engine/vision/sight/CanSeePoint";
import {coneOf} from "@gunsmith/engine/vision/ConeOf";
import type {VisibleToPlayer} from "@gunsmith/engine/vision/types/VisibleToPlayer";

/**
 * What the player sees in `world`: the opponent and each dummy, inside the player's cone and with no wall in the way and, if
 * they crouch, no cover block right beside them, and the pickup lying in the arena, by the same rule as a place.
 */
export function visibleToPlayer(world: World): VisibleToPlayer {
  const {opponent, arena} = world;
  const cone = coneOf(arena, world.player);

  return {
    opponent: opponent !== undefined && canSeeFighter(arena, cone, opponent),
    pickup: world.pickup !== undefined && canSeePoint(arena, cone, world.pickup.position),
    dummies: world.dummies.map(dummy =>
      canSeeFighter(arena, cone, {position: dummy.position, crouching: dummy.crouching === true}),
    ),
    bullets: world.bullets.map(bullet => bullet.shooter === "player" || canSeePoint(arena, cone, bullet.position)),
  };
}
