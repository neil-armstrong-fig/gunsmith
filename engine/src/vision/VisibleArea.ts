import type {Point} from "@gunsmith/engine/geometry/types/Point";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import {blocksSightFrom} from "@gunsmith/engine/height/BlocksSightFrom";
import {reachAlong} from "@gunsmith/engine/vision/outline/ReachAlong";
import type {Cone} from "@gunsmith/engine/vision/types/Cone";

/** The cone's width is swept by this many rays, plus one at each edge, so the outline is smooth enough to look like a cone. */
const RAYS_ACROSS_THE_CONE = 48;

/**
 * The outline of what the cone shows in detail: the apex, then the point each ray across the cone's width reaches
 * before it meets a wall, ground higher than the viewer's eye level, a cover block (to a crouching viewer) or the end of its range, from one edge of the cone round to the other. It is the cone with the
 * walls and the higher ground cut out of it, always the same number of points, so a drawing can reuse its buffers. Sight never
 * reaches farther than a bullet does (a bullet stops at walls only), so a bullet can reach whatever the outline shows.
 */
export function visibleArea(arena: Arena, cone: Cone): readonly Point[] {
  const aimAngle = Math.atan2(cone.aim.y, cone.aim.x);
  const edge = aimAngle - cone.halfAngleRadians;
  const rays = Array.from({length: RAYS_ACROSS_THE_CONE + 1}, (_, index) => {
    const angle = edge + (2 * cone.halfAngleRadians * index) / RAYS_ACROSS_THE_CONE;

    return reach(arena, cone, angle);
  });

  return [cone.apex, ...rays];
}

function reach(arena: Arena, cone: Cone, angle: number): Point {
  const direction = {x: Math.cos(angle), y: Math.sin(angle)};
  const length = reachAlong(blocksSightFrom(arena, cone), {position: cone.apex, direction}, cone.range);

  return {x: cone.apex.x + direction.x * length, y: cone.apex.y + direction.y * length};
}
