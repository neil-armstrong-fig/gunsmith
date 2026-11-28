import type {PositionSample} from "@src/dsl/gunsmith/components/room/components/smoothness/playwright/movement/types/PositionSample";

/** The shortest stretch of time a speed is judged over, in seconds: a dropped frame or a late snapshot must not count as a jump. */
const SHORTEST_STRETCH_SECONDS = 0.1;

/**
 * The fastest the samples move, in tiles a second, over any stretch of at least 0.1 s. A speed is judged in measured time, not per sample,
 * so a frame the browser dropped under load stretches the time and does not look like a teleport. Zero when no two samples are that far apart.
 */
export function fastestMovement(samples: readonly PositionSample[]): number {
  let fastest = 0;

  for (let from = 0; from < samples.length; from += 1) {
    for (let to = from + 1; to < samples.length; to += 1) {
      const start = samples[from];
      const end = samples[to];
      if (!start || !end || end.seconds - start.seconds < SHORTEST_STRETCH_SECONDS) {
        continue;
      }

      fastest = Math.max(fastest, Math.hypot(end.x - start.x, end.y - start.y) / (end.seconds - start.seconds));
    }
  }

  return fastest;
}
