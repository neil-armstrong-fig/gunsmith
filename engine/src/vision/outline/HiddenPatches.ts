import type {Point} from "@gunsmith/engine/geometry/types/Point";
import type {Polygon} from "@gunsmith/engine/geometry/types/Polygon";
import type {SightRay} from "@gunsmith/engine/vision/types/SightRay";
import type {Stretch} from "@gunsmith/engine/vision/types/Stretch";

/**
 * The patches of floor inside a cone's outline that the viewer does not see: the gaps between the stretches each ray sees, joined
 * across to the next ray's. The outline joins each ray's farthest seen point to the next ray's, so every patch is kept inside the
 * wedge between two neighbouring rays and short of that join, and no two patches overlap. Where two neighbours have the same
 * number of gaps, the first gap on one is joined to the first on the other, and so on; where they differ (at the end of a far
 * platform), each ray's gaps reach only half way across the wedge, cut off where the outline crosses that half-way line.
 */
export function hiddenPatches(apex: Point, rays: readonly SightRay[]): readonly Polygon[] {
  const patches: Polygon[] = [];
  for (let index = 0; index + 1 < rays.length; index += 1) {
    const one = rays[index];
    const other = rays[index + 1];
    if (one && other) {
      patches.push(...patchesBetween(apex, one, other));
    }
  }

  return patches;
}

function patchesBetween(apex: Point, one: SightRay, other: SightRay): readonly Polygon[] {
  const oneGaps = gapsOf(one);
  const otherGaps = gapsOf(other);
  if (oneGaps.length === otherGaps.length) {
    return oneGaps.flatMap((gap, index) => {
      const across = otherGaps[index];
      if (!across) {
        return [];
      }

      return [
        [at(apex, one, gap.from), at(apex, one, gap.to), at(apex, other, across.to), at(apex, other, across.from)],
      ];
    });
  }

  const middle = middleOf(one, other);

  return [...halfPatches(apex, one, middle), ...halfPatches(apex, other, middle)];
}

/**
 * The ray half way between two neighbours, seen as far as the outline's join between their farthest seen points crosses it, so a
 * patch that stops there stays inside the outline.
 */
function middleOf(one: SightRay, other: SightRay): SightRay {
  const sum = {x: one.direction.x + other.direction.x, y: one.direction.y + other.direction.y};
  const length = Math.hypot(sum.x, sum.y);
  const direction = {x: sum.x / length, y: sum.y / length};
  const oneEnd = scaled(one.direction, reachOf(one));
  const otherEnd = scaled(other.direction, reachOf(other));
  const join = {x: otherEnd.x - oneEnd.x, y: otherEnd.y - oneEnd.y};
  const across = cross(direction, join);
  if (Math.abs(across) < 1e-12) {
    return {direction, seen: [{from: 0, to: Math.min(reachOf(one), reachOf(other))}]};
  }

  return {direction, seen: [{from: 0, to: cross(oneEnd, join) / across}]};
}

/** The patches between `ray` and the half-way ray `middle`, each of the ray's gaps cut off where `middle` stops. */
function halfPatches(apex: Point, ray: SightRay, middle: SightRay): readonly Polygon[] {
  const limit = reachOf(middle);

  return gapsOf(ray).map(gap => {
    const near = at(apex, middle, Math.min(gap.from, limit));
    const far = at(apex, middle, Math.min(gap.to, limit));
    if (gap.from >= limit) {
      return [at(apex, ray, gap.from), at(apex, ray, gap.to), far];
    }

    return [at(apex, ray, gap.from), at(apex, ray, gap.to), far, near];
  });
}

/** The gaps on `ray` between one stretch it sees and the next. */
function gapsOf(ray: SightRay): readonly Stretch[] {
  return ray.seen.slice(1).flatMap((stretch, index) => {
    const before = ray.seen[index];
    if (!before) {
      return [];
    }

    return [{from: before.to, to: stretch.from}];
  });
}

/** The farthest point `ray` sees, as a distance from the apex. */
function reachOf(ray: SightRay): number {
  return ray.seen[ray.seen.length - 1]?.to ?? 0;
}

function at(apex: Point, ray: SightRay, distance: number): Point {
  return {x: apex.x + ray.direction.x * distance, y: apex.y + ray.direction.y * distance};
}

function scaled(direction: Point, distance: number): Point {
  return {x: direction.x * distance, y: direction.y * distance};
}

function cross(a: Point, b: Point): number {
  return a.x * b.y - a.y * b.x;
}
