import {isPlaceToStand} from "@gunsmith/engine/arena/symmetry/IsPlaceToStand";
import type {WalkSearch} from "@gunsmith/engine/arena/symmetry/spawn-pairs/matched-distances/types/WalkSearch";
import type {PlacePair} from "@gunsmith/engine/arena/symmetry/spawn-pairs/types/PlacePair";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {routeDistancesFrom} from "@gunsmith/engine/pickup/placement/RouteDistancesFrom";

/**
 * The pairs of places two fighters could start on an arena that is not the same picture turned half way round: the pairs that are
 * the most nearly the same walk from the middle of the arena. Both tiles are open floor, not stairs, on one level and at least
 * `minimumSteps` steps apart on foot, and a tile is never paired with itself. The middle is the centre tile, or, when that is a wall
 * or a stair, the nearest tile to stand on, the lowest in the drawing of those equally near. Every pair with the smallest difference
 * between the two walks comes back, the tile with the lower place first and the pairs in the order of their first tile, rows from the
 * south, so the same arena always lists them the same way. When no pair is as far apart as `minimumSteps`, the minimum falls to the
 * longest walk between two tiles on one level, so a small arena still has a pair. None means there is nowhere to start two fighters.
 */
export function matchedDistancePairs(arena: Arena, minimumSteps: number): readonly PlacePair[] {
  const middle = middleTileOf(arena);
  if (middle === undefined) {
    return [];
  }

  const stepsFromMiddle = routeDistancesFrom(arena, pointOf(arena, middle));
  const tiles = [...stepsFromMiddle.keys()].filter(index => isPlaceToStand(arena, index)).sort(byIndex);
  const search = {
    arena,
    tiles,
    buckets: bucketsOf(arena, tiles, stepsFromMiddle),
    stepsFromMiddle,
    walkFrom: walksFrom(arena),
    minimumSteps,
  };

  const pairs = bestPairs(search);
  if (pairs.length > 0) {
    return pairs;
  }

  return bestPairs({...search, minimumSteps: longestWalk(search)});
}

/** The centre tile when it can be stood on, otherwise the nearest tile that can, the lowest index of those equally near. */
function middleTileOf(arena: Arena): number | undefined {
  const centre = Math.floor(arena.height / 2) * arena.width + Math.floor(arena.width / 2);
  if (isPlaceToStand(arena, centre)) {
    return centre;
  }

  let nearest: number | undefined;
  let nearestSquared = Infinity;
  for (let index = 0; index < arena.solid.length; index += 1) {
    const squared = squaredTilesBetween(arena, index, centre);
    if (isPlaceToStand(arena, index) && squared < nearestSquared) {
      nearest = index;
      nearestSquared = squared;
    }
  }

  return nearest;
}

function bucketsOf(
  arena: Arena,
  tiles: readonly number[],
  stepsFromMiddle: ReadonlyMap<number, number>,
): ReadonlyMap<string, readonly number[]> {
  const buckets = new Map<string, number[]>();
  for (const index of tiles) {
    const key = bucketKey(arena.levels[index], stepsFromMiddle.get(index));
    buckets.set(key, [...(buckets.get(key) ?? []), index]);
  }

  return buckets;
}

function walksFrom(arena: Arena): (index: number) => ReadonlyMap<number, number> {
  const walks = new Map<number, ReadonlyMap<number, number>>();

  return index => {
    const known = walks.get(index);
    if (known) {
      return known;
    }

    const walk = routeDistancesFrom(arena, pointOf(arena, index));
    walks.set(index, walk);

    return walk;
  };
}

/** The pairs at the smallest score (difference between the two walks from the middle) that has any, or none. */
function bestPairs(search: WalkSearch): readonly PlacePair[] {
  const furthest = Math.max(0, ...search.stepsFromMiddle.values());

  for (let score = 0; score <= furthest; score += 1) {
    const pairs = pairsWithScore(search, score);
    if (pairs.length > 0) {
      return pairs;
    }
  }

  return [];
}

function pairsWithScore(search: WalkSearch, score: number): readonly PlacePair[] {
  const {arena} = search;
  const pairs: PlacePair[] = [];

  for (const first of search.tiles) {
    const key = bucketKey(arena.levels[first], (search.stepsFromMiddle.get(first) ?? 0) + score);
    for (const second of search.buckets.get(key) ?? []) {
      if ((score > 0 || second > first) && isFarEnough(search, first, second)) {
        pairs.push(pairOf(arena, first, second));
      }
    }
  }

  return pairs.sort((one, other) => {
    return (
      indexOf(arena, one.first) - indexOf(arena, other.first) ||
      indexOf(arena, one.second) - indexOf(arena, other.second)
    );
  });
}

/**
 * Whether the walk between two tiles is at least `search.minimumSteps`. Two bounds say so without a search: the walk is no longer
 * than the two walks from the middle added up, and no shorter than the same number of tiles across and up.
 */
function isFarEnough(search: WalkSearch, first: number, second: number): boolean {
  const {arena, minimumSteps} = search;
  if ((search.stepsFromMiddle.get(first) ?? 0) + (search.stepsFromMiddle.get(second) ?? 0) < minimumSteps) {
    return false;
  }

  const across = Math.abs((first % arena.width) - (second % arena.width));
  const up = Math.abs(Math.floor(first / arena.width) - Math.floor(second / arena.width));
  if (across + up >= minimumSteps) {
    return true;
  }

  return (search.walkFrom(first).get(second) ?? 0) >= minimumSteps;
}

/** The longest walk between two different tiles on one level, 0 when there are none. */
function longestWalk(search: WalkSearch): number {
  let longest = 0;
  for (const first of search.tiles) {
    for (const second of search.tiles) {
      if (first !== second && search.arena.levels[first] === search.arena.levels[second]) {
        longest = Math.max(longest, search.walkFrom(first).get(second) ?? 0);
      }
    }
  }

  return longest;
}

function bucketKey(level: number | undefined, steps: number | undefined): string {
  return `${level}:${steps}`;
}

function pairOf(arena: Arena, first: number, second: number): PlacePair {
  return {first: pointOf(arena, Math.min(first, second)), second: pointOf(arena, Math.max(first, second))};
}

function pointOf(arena: Arena, index: number): Point {
  return {x: (index % arena.width) + 0.5, y: Math.floor(index / arena.width) + 0.5};
}

function indexOf(arena: Arena, point: Point): number {
  return Math.floor(point.y) * arena.width + Math.floor(point.x);
}

function squaredTilesBetween(arena: Arena, first: number, second: number): number {
  const across = (first % arena.width) - (second % arena.width);
  const up = Math.floor(first / arena.width) - Math.floor(second / arena.width);

  return across * across + up * up;
}

function byIndex(first: number, second: number): number {
  return first - second;
}
