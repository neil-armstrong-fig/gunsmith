import type {PositionSample} from "@src/dsl/gunsmith/components/room/playwright/wire/movement/types/PositionSample";

/**
 * The largest step, in tiles, that a fighter took between two samples beyond what walking at `walkingSpeed` tiles a second explains over the
 * time between them. A walk, however uneven the frames, is zero; a correction that lands in one frame is its whole distance. Measured against
 * the time that really passed between the two samples, so a frame dropped under load stretches the allowance and is not read as a jump.
 */
export function largestJump(samples: readonly PositionSample[], walkingSpeed: number): number {
  let largest = 0;

  for (let index = 1; index < samples.length; index += 1) {
    const before = samples[index - 1];
    const after = samples[index];
    if (!before || !after) {
      continue;
    }

    const stepped = Math.hypot(after.x - before.x, after.y - before.y);
    largest = Math.max(largest, stepped - walkingSpeed * (after.seconds - before.seconds));
  }

  return largest;
}
