import type {BlockedTiles} from "@gunsmith/engine/arena/types/BlockedTiles";
import type {Ray} from "@gunsmith/engine/bullet/flight/types/Ray";

/** A line is checked at least this often along its length, so a one-tile wall can never be jumped. */
const SAMPLE_SPACING = 0.1;

/** How far along its next `distance` the ray (a line of sight) first finds a blocked tile (zero when it starts in one); `undefined` when clear. */
export function distanceToWall(blocked: BlockedTiles, ray: Ray, distance: number): number | undefined {
  const samples = Math.max(1, Math.ceil(distance / SAMPLE_SPACING));

  for (let sample = 0; sample <= samples; sample += 1) {
    const travelled = (distance * sample) / samples;
    const x = ray.position.x + ray.direction.x * travelled;
    const y = ray.position.y + ray.direction.y * travelled;

    if (blocked(Math.floor(x), Math.floor(y))) {
      return travelled;
    }
  }

  return undefined;
}
