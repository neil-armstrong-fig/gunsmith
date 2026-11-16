import {nextRandom} from "@gunsmith/engine/random/NextRandom";
import {PICKUP_SEED_SALT} from "@gunsmith/engine/pickup/placement/PickupSeedSalt";
import {routeDistancesFrom} from "@gunsmith/engine/pickup/placement/RouteDistancesFrom";
import type {Pickup} from "@gunsmith/engine/pickup/types/Pickup";
import type {PickupRequest} from "@gunsmith/engine/pickup/types/PickupRequest";

/**
 * The pickup of a round that has just begun: it lies on the middle of a floor tile that is as near as can be to equally far
 * from every fighter's start by the way they would walk (steps, with a stair the only way across a drop), never on a tile a
 * fighter stands on. Where tiles tie it is drawn from the seed on a stream of its own, in row order, so the same seed picks
 * the same tile whichever fighter is listed first. Walking is the same both ways, so if one fighter cannot reach another's
 * start no pickup can be fair, and it throws, as the ring does.
 */
export function startPickup(request: PickupRequest): Pickup {
  const {arena, starts, seed, weapon} = request;
  const [firstStart] = starts;
  if (!firstStart) {
    throw new Error("A pickup needs at least one fighter to be as far from.");
  }

  const distances = starts.map(start => routeDistancesFrom(arena, start));
  const [fromFirst] = distances;
  for (const start of starts) {
    if (!fromFirst?.has(Math.floor(start.y) * arena.width + Math.floor(start.x))) {
      throw new Error(`The fighters cannot walk to each other: no pickup can be fair (from ${start.x}, ${start.y}).`);
    }
  }

  const tiles = [...(fromFirst?.keys() ?? [])]
    .sort((a, b) => a - b)
    .map(tile => ({tile, steps: distances.map(fromStart => fromStart.get(tile) ?? 0)}))
    .filter(({steps}) => steps.every(stepCount => stepCount > 0));
  const fairest = Math.min(...tiles.map(({steps}) => unevenness(steps)));
  const candidates = tiles.filter(({steps}) => unevenness(steps) === fairest);

  const chosen = candidates[Math.floor(nextRandom(seed ^ PICKUP_SEED_SALT).value * candidates.length)];
  if (!chosen) {
    throw new Error("There is no ground to lay a pickup on.");
  }

  return {position: {x: (chosen.tile % arena.width) + 0.5, y: Math.floor(chosen.tile / arena.width) + 0.5}, weapon};
}

/** How much farther the farthest fighter would walk than the nearest: nothing when the tile is exactly as far from them all. */
function unevenness(steps: readonly number[]): number {
  return Math.max(...steps) - Math.min(...steps);
}
