import {isSolid} from "@gunsmith/engine/arena/IsSolid";
import {levelOfTile} from "@gunsmith/engine/arena/LevelOfTile";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {blocksSightFrom} from "@gunsmith/engine/height/BlocksSightFrom";
import {EDGE_REACH_TILES} from "@gunsmith/engine/height/EdgeReach";
import {eyeLevelAt} from "@gunsmith/engine/height/EyeLevelAt";
import {hasClearSight} from "@gunsmith/engine/vision/sight/HasClearSight";
import type {Cone} from "@gunsmith/engine/vision/types/Cone";
import type {RaySamples} from "@gunsmith/engine/vision/types/RaySamples";
import type {Stretch} from "@gunsmith/engine/vision/types/Stretch";
import type {Transition} from "@gunsmith/engine/vision/types/Transition";

/** The ray is checked this often, so a one-tile wall can never be jumped. */
const SAMPLE_SPACING = 0.1;
/** Halving a gap between a seen and a hidden sample this many times pins the edge to a few thousandths of a tile; each halving walks the line again. */
const HALVINGS = 5;

/**
 * The stretches along `direction` from the cone's apex, out to its range, where the sight rule (`hasClearSight`) shows a point, in
 * order, the first from the apex. There is more than one when the viewer looks across ground they cannot see down onto at ground on
 * their own level beyond it (from deep on a platform, across low ground, at a second platform); a wall or a cover block the viewer's
 * eye meets ends the last. Asking `hasClearSight` at every step would walk the whole line again each time, so the ray is walked once,
 * keeping the highest floor met so far, and the rule is applied to those running heights; each gap between a seen and a hidden
 * sample is then halved with `hasClearSight` itself, so the ends drawn are the rule's, on a face rather than a little past it.
 */
export function stretchesSeenAlong(arena: Arena, cone: Cone, direction: Point): readonly Stretch[] {
  const samples = Math.max(1, Math.ceil(cone.range / SAMPLE_SPACING));
  const step = cone.range / samples;
  const pointAt = (travelled: number): Point => {
    return {x: cone.apex.x + direction.x * travelled, y: cone.apex.y + direction.y * travelled};
  };
  // The last distance between a seen and a hidden sample at which `hasClearSight` still shows the point, found by halving.
  const edgeOf = (transition: Transition): number => {
    let {seen, hidden} = transition;
    for (let halving = 0; halving < HALVINGS; halving += 1) {
      const middle = (seen + hidden) / 2;
      if (hasClearSight(arena, {from: cone.apex, eye: cone, to: pointAt(middle)})) {
        seen = middle;
      } else {
        hidden = middle;
      }
    }

    return seen;
  };

  const seen = seenSamples(arena, cone, {pointAt, samples, step});
  const stretches: Stretch[] = [];
  let from: number | undefined = 0;
  for (let sample = 1; sample <= samples; sample += 1) {
    if (from === undefined && seen[sample]) {
      from = edgeOf({seen: sample * step, hidden: (sample - 1) * step});
    } else if (from !== undefined && !seen[sample]) {
      stretches.push({from, to: edgeOf({seen: (sample - 1) * step, hidden: sample * step})});
      from = undefined;
    }
  }

  if (from !== undefined) {
    stretches.push({from, to: cone.range});
  }

  return stretches;
}

/**
 * Whether the sight rule shows each sample along the ray, judged from the floor met on the way: a wall (or a cover block the
 * viewer's eye meets) hides it and every sample after it; then, for a point on the viewer's own level, any floor above it; for a
 * higher point, floor above the viewer short of the point's `EDGE_REACH_TILES`, or above the point within them; for a lower point,
 * floor above the viewer within the viewer's `EDGE_REACH_TILES`, or above the point beyond them.
 */
function seenSamples(arena: Arena, cone: Cone, ray: RaySamples): readonly boolean[] {
  const blocksViewer = blocksSightFrom(arena, cone);
  const reachSamples = EDGE_REACH_TILES / ray.step;
  const floors: number[] = [];
  const highestSoFar: number[] = [];
  const seen: boolean[] = [];
  let highestPastReach = Number.NEGATIVE_INFINITY;
  const isHidden = (sample: number, level: number): boolean => {
    if (level === cone.eyeLevel) {
      return (highestSoFar[sample] ?? 0) > cone.eyeLevel;
    }

    if (level > cone.eyeLevel) {
      const lowPartEnd = Math.floor(sample - reachSamples);
      if (lowPartEnd >= 0 && (highestSoFar[lowPartEnd] ?? 0) > cone.eyeLevel) {
        return true;
      }

      return highestSince(floors, Math.ceil(sample - reachSamples)) > level;
    }

    if ((highestSoFar[Math.min(sample, Math.floor(reachSamples))] ?? 0) > cone.eyeLevel) {
      return true;
    }

    return highestPastReach > level;
  };

  for (let sample = 0; sample <= ray.samples; sample += 1) {
    const point = ray.pointAt(sample * ray.step);
    const tileX = Math.floor(point.x);
    const tileY = Math.floor(point.y);
    if (isSolid(arena, tileX, tileY) && blocksViewer(tileX, tileY)) {
      return seen;
    }

    const floor = floorOf(arena, tileX, tileY);
    floors.push(floor);
    highestSoFar.push(Math.max(highestSoFar[sample - 1] ?? Number.NEGATIVE_INFINITY, floor));
    if (sample >= reachSamples) {
      highestPastReach = Math.max(highestPastReach, floor);
    }

    seen.push(!isHidden(sample, eyeLevelAt(arena, point)));
  }

  return seen;
}

/** The highest of `floors` from index `first` (or the start) to the end. */
function highestSince(floors: readonly number[], first: number): number {
  let highest = Number.NEGATIVE_INFINITY;
  for (let index = Math.max(0, first); index < floors.length; index += 1) {
    highest = Math.max(highest, floors[index] ?? Number.NEGATIVE_INFINITY);
  }

  return highest;
}

/** The level of a tile's floor, or none for a solid tile the viewer sees past (a cover block below a standing eye). */
function floorOf(arena: Arena, tileX: number, tileY: number): number {
  if (isSolid(arena, tileX, tileY)) {
    return Number.NEGATIVE_INFINITY;
  }

  return levelOfTile(arena, tileX, tileY);
}
