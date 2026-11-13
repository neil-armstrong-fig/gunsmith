import {DIFFICULTY} from "@gunsmith/engine/opponent/Difficulty";
import type {BurstAdvance} from "@gunsmith/engine/opponent/state/engage/types/BurstAdvance";
import type {BurstRequest} from "@gunsmith/engine/opponent/state/engage/types/BurstRequest";
import type {OpponentBrain} from "@gunsmith/engine/opponent/types/OpponentBrain";
import {nextRandom} from "@gunsmith/engine/random/NextRandom";

/**
 * The burst clock. First the opponent waits out its reaction time with its fire held. Then it cycles: when neither a burst
 * nor a rest is running it starts a burst, which keeps the trigger down for `burstShots` shots of the weapon in hand (so a
 * faster weapon gets a shorter burst: the trigger is let go half an interval before the shot after the last one) and draws
 * this burst's aim roll; when the burst runs out it rests for `restSeconds`. Everything is counted in the brain, so nothing
 * here reads the clock.
 */
export function advanceBurst(brain: OpponentBrain, request: BurstRequest): BurstAdvance {
  if (brain.reactionRemainingSeconds > 0) {
    return {
      firing: false,
      brain: {...brain, reactionRemainingSeconds: Math.max(0, brain.reactionRemainingSeconds - request.seconds)},
    };
  }

  if (brain.fireRemainingSeconds <= 0 && brain.restRemainingSeconds > 0) {
    return {
      firing: false,
      brain: {...brain, restRemainingSeconds: Math.max(0, brain.restRemainingSeconds - request.seconds)},
    };
  }

  return {firing: true, brain: fireOn(startBurstIfNone(brain, request), request.seconds)};
}

function startBurstIfNone(brain: OpponentBrain, request: BurstRequest): OpponentBrain {
  if (brain.fireRemainingSeconds > 0) {
    return brain;
  }

  const draw = nextRandom(brain.seed);

  return {
    ...brain,
    seed: draw.seed,
    aimRoll: draw.value * 2 - 1,
    fireRemainingSeconds: (DIFFICULTY.burstShots - 0.5) * request.fireIntervalSeconds,
  };
}

function fireOn(brain: OpponentBrain, seconds: number): OpponentBrain {
  const fireRemainingSeconds = Math.max(0, brain.fireRemainingSeconds - seconds);
  if (fireRemainingSeconds > 0) {
    return {...brain, fireRemainingSeconds};
  }

  return {...brain, fireRemainingSeconds, restRemainingSeconds: DIFFICULTY.restSeconds};
}
