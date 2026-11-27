import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {hiddenPatches} from "@gunsmith/engine/vision/outline/HiddenPatches";
import {stretchesSeenAlong} from "@gunsmith/engine/vision/outline/StretchesSeenAlong";
import type {Cone} from "@gunsmith/engine/vision/types/Cone";
import type {SightRay} from "@gunsmith/engine/vision/types/SightRay";
import type {VisibleArea} from "@gunsmith/engine/vision/types/VisibleArea";

/** The cone's width is swept by this many rays, plus one at each edge, so the outline is smooth enough to look like a cone. */
const RAYS_ACROSS_THE_CONE = 48;

/**
 * What the cone shows in detail, by the sight rule (`hasClearSight`). The outline is the apex, then the farthest point each ray across
 * the cone's width sees before a wall, a cover block (to a crouching viewer), raised ground or the end of its range stops it for good,
 * from one edge of the cone round to the other: always the same number of points. Inside it, the hidden patches are the ground a ray
 * passes over without seeing on its way to ground it sees again: from deep on a platform, the low ground below it, on the way to a
 * second platform on the same level, which shows in full. A bullet reaches the body of anyone standing where it shows (it flies a
 * body's width short of `EDGE_REACH_TILES` onto higher ground).
 */
export function visibleArea(arena: Arena, cone: Cone): VisibleArea {
  const aimAngle = Math.atan2(cone.aim.y, cone.aim.x);
  const edge = aimAngle - cone.halfAngleRadians;
  const rays = Array.from({length: RAYS_ACROSS_THE_CONE + 1}, (_, index): SightRay => {
    const angle = edge + (2 * cone.halfAngleRadians * index) / RAYS_ACROSS_THE_CONE;
    const direction = {x: Math.cos(angle), y: Math.sin(angle)};

    return {direction, seen: stretchesSeenAlong(arena, cone, direction)};
  });

  return {
    outline: [cone.apex, ...rays.map(ray => farthestSeen(cone.apex, ray))],
    hidden: hiddenPatches(cone.apex, rays),
  };
}

function farthestSeen(apex: Point, ray: SightRay): Point {
  const reach = ray.seen[ray.seen.length - 1]?.to ?? 0;

  return {x: apex.x + ray.direction.x * reach, y: apex.y + ray.direction.y * reach};
}
