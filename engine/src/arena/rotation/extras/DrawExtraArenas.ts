import {nextRandom} from "@gunsmith/engine/random/NextRandom";
import {ARENA_ROTATION} from "@gunsmith/engine/arena/rotation/ArenaRotationLimits";
import {ARENA_ROTATION_SEED_SALT} from "@gunsmith/engine/arena/rotation/extras/seed/ArenaRotationSeedSalt";
import type {ArenasOfDayInput} from "@gunsmith/engine/arena/rotation/types/ArenasOfDayInput";
import type {ExtraArenasRequest} from "@gunsmith/engine/arena/rotation/types/ExtraArenasRequest";

/**
 * Draws `count` different arenas, none of them already kept, one at a time from the day's own stream (`day ^ ARENA_ROTATION_SEED_SALT`).
 * An arena's weight is 1 over 1 plus the times it was played in the `recentDays` days before the day, so one nobody has played
 * lately weighs 1 and one played every day of the week weighs about an eighth as much per play. Draws take the candidates in the
 * pool's order, so the same day, pool and plays always give the same arenas; when fewer than `count` are left, all of them are drawn.
 */
export function drawExtraArenas(input: ArenasOfDayInput, request: ExtraArenasRequest): string[] {
  const recent = recentPlaysOf(input);
  const candidates = input.arenas.filter(name => !request.kept.includes(name));
  const drawn: string[] = [];
  let seed = (input.day ^ ARENA_ROTATION_SEED_SALT) | 0;

  while (drawn.length < request.count && candidates.length > 0) {
    const weights = candidates.map(name => 1 / (1 + (recent.get(name) ?? 0)));
    const draw = nextRandom(seed);
    seed = draw.seed;

    const index = indexAt(weights, draw.value * weights.reduce((sum, weight) => sum + weight, 0));
    const [name] = candidates.splice(index, 1);
    if (name !== undefined) {
      drawn.push(name);
    }
  }

  return drawn;
}

function recentPlaysOf(input: ArenasOfDayInput): Map<string, number> {
  const recent = new Map<string, number>();
  for (const {arena, day, count} of input.plays) {
    if (day < input.day && day >= input.day - ARENA_ROTATION.recentDays) {
      recent.set(arena, (recent.get(arena) ?? 0) + count);
    }
  }

  return recent;
}

/** The index whose stretch of the running total of the weights holds `target`; the last one when rounding leaves it past the end. */
function indexAt(weights: readonly number[], target: number): number {
  let total = 0;
  for (let index = 0; index < weights.length; index += 1) {
    total += weights[index] ?? 0;
    if (target < total) {
      return index;
    }
  }

  return weights.length - 1;
}
