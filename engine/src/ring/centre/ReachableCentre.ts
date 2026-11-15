import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {nextRandom} from "@gunsmith/engine/random/NextRandom";
import {RING_SEED_SALT} from "@gunsmith/engine/ring/centre/seed/RingSeedSalt";
import {tilesReachableFrom} from "@gunsmith/engine/ring/centre/reach/TilesReachableFrom";
import type {RingRequest} from "@gunsmith/engine/ring/types/RingRequest";

/**
 * The point the ring closes on: the middle of one floor tile that every fighter can walk to from where they start, drawn
 * from the request's seed on a stream of its own. Walking is the same both ways, so the tiles one fighter can reach are
 * the tiles all of them can, or they cannot reach each other at all and no ring can be fair, and it throws, as `arenaFrom`
 * does for a drawing that cannot be played. The tiles are put in row order first, so the same seed picks the same tile
 * whichever fighter is listed first.
 */
export function reachableCentre(request: RingRequest): Point {
  const {arena, starts, seed} = request;
  const [firstStart, ...otherStarts] = starts;
  if (!firstStart) {
    throw new Error("A ring needs at least one fighter to start from.");
  }

  const reachable = tilesReachableFrom(arena, firstStart);
  const reachableKeys = new Set(reachable.map(keyOf));
  for (const start of otherStarts) {
    if (!reachableKeys.has(keyOf(start))) {
      throw new Error(
        `The fighters cannot walk to each other: no ring can close on ground they share (from ${start.x}, ${start.y}).`,
      );
    }
  }

  const inRowOrder = [...reachable].sort(
    (a, b) => Math.floor(a.y) - Math.floor(b.y) || Math.floor(a.x) - Math.floor(b.x),
  );
  const draw = nextRandom(seed ^ RING_SEED_SALT);
  const chosen = inRowOrder[Math.floor(draw.value * inRowOrder.length)];
  if (!chosen) {
    throw new Error("There is no ground to close a ring on.");
  }

  return chosen;
}

function keyOf(point: Point): string {
  return `${Math.floor(point.x)},${Math.floor(point.y)}`;
}
