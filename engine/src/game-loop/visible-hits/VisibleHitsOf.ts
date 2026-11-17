import type {HitTarget} from "@gunsmith/engine/bullet/types/HitTarget";
import type {LandedHit} from "@gunsmith/engine/bullet/types/LandedHit";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import {visibleToPlayer} from "@gunsmith/engine/vision/VisibleToPlayer";
import type {VisibleToPlayer} from "@gunsmith/engine/vision/types/VisibleToPlayer";

/**
 * What of `hits` the player could see in `world`, by the same sight rule that decides what they are shown, in order. A hit
 * on a target out of sight is dropped, so nothing about where it stands reaches the player's events. Pass the world as it
 * stands when the bullets land: the fighters as they have moved and turned this step.
 */
export function visibleHitsOf(world: World, hits: readonly LandedHit[]): HitTarget[] {
  if (hits.length === 0) {
    return [];
  }

  const visible = visibleToPlayer(world);

  return hits.filter(hit => isVisible(visible, hit)).map(hit => hit.on);
}

function isVisible(visible: VisibleToPlayer, hit: LandedHit): boolean {
  if (hit.on === "opponent") {
    return visible.opponent;
  }

  return hit.dummyIndex !== undefined && visible.dummies[hit.dummyIndex] === true;
}
