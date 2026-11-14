import type {World} from "@gunsmith/engine/game-loop/types/World";
import {canSeePoint} from "@gunsmith/engine/vision/CanSeePoint";
import {coneOf} from "@gunsmith/engine/vision/ConeOf";
import type {VisibleToPlayer} from "@gunsmith/engine/vision/types/VisibleToPlayer";

/** What the player sees in `world`: the opponent and each dummy, inside the player's cone and with no wall in the way. */
export function visibleToPlayer(world: World): VisibleToPlayer {
  const cone = coneOf(world.player);
  const {opponent, arena} = world;

  return {
    opponent: opponent !== undefined && canSeePoint(arena, cone, opponent.position),
    dummies: world.dummies.map(dummy => canSeePoint(arena, cone, dummy.position)),
    bullets: world.bullets.map(bullet => bullet.shooter === "player" || canSeePoint(arena, cone, bullet.position)),
  };
}
