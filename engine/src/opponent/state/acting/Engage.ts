import {coverBesideTarget} from "@gunsmith/engine/cover/CoverBesideTarget";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {equippedWeapon} from "@gunsmith/engine/loadout/EquippedWeapon";
import {aimErrorFor} from "@gunsmith/engine/opponent/state/acting/engage/aim/AimErrorFor";
import {missedAimPoint} from "@gunsmith/engine/opponent/state/acting/engage/aim/MissedAimPoint";
import {advanceBurst} from "@gunsmith/engine/opponent/state/acting/engage/AdvanceBurst";
import {advanceStrafe} from "@gunsmith/engine/opponent/state/acting/engage/AdvanceStrafe";
import {engageDirection} from "@gunsmith/engine/opponent/state/acting/engage/EngageDirection";
import type {BurstAdvance} from "@gunsmith/engine/opponent/state/acting/engage/types/BurstAdvance";
import type {HeadingRequest} from "@gunsmith/engine/opponent/state/acting/engage/types/HeadingRequest";
import type {OpponentBrain} from "@gunsmith/engine/opponent/types/OpponentBrain";
import type {OpponentContext} from "@gunsmith/engine/opponent/types/OpponentContext";
import type {StateAct} from "@gunsmith/engine/opponent/types/StateAct";

/**
 * Engaging: it has the player in sight. It stands and turns to face them while it waits out its reaction time, then holds
 * the trigger in bursts, aiming a little off (an error that shrinks the longer it has had them in sight) and walking
 * the range: in when they are far, away when they are near, circling in between, changing sides every second or two. It
 * does not reload: running dry is `chooseState`'s cue to leave for the reload state.
 */
export function actEngage(brain: OpponentBrain, context: OpponentContext): StateAct {
  const {opponent, target, seconds} = context;
  const burst = advanceBurst(advanceStrafe(brain, seconds), {
    fireIntervalSeconds: equippedWeapon(opponent).weapon.fireIntervalSeconds,
    seconds,
  });
  const error = aimErrorFor({seenSeconds: burst.brain.seenSeconds, roll: burst.brain.aimRoll});

  const ducking = isDucking(burst, context);

  return {
    input: {
      direction: heading({brain, context, side: burst.brain.strafeSide, ducking}),
      aimAt: missedAimPoint(opponent.position, target.position, error),
      firing: burst.firing,
      crouching: ducking,
      reload: false,
    },
    brain: burst.brain,
  };
}

/**
 * Whether it ducks this step: it is resting between bursts (its reaction time is over and the trigger is up) with a cover block
 * beside it on the line to the player, which hides a crouched fighter from them and shields them from a bullet. It stands for its
 * reaction time and for every shot, since a crouched shooter's bullets are stopped by the block it hides behind.
 */
function isDucking(burst: BurstAdvance, context: OpponentContext): boolean {
  if (burst.firing || burst.brain.reactionRemainingSeconds > 0) {
    return false;
  }

  return coverBesideTarget(context.arena, context.target.position, context.opponent.position);
}

/** Where it walks: nowhere while it waits out its reaction time or ducks, then the way `engageDirection` says. */
function heading({brain, context, side, ducking}: HeadingRequest): Point {
  if (ducking || !walking(brain)) {
    return {x: 0, y: 0};
  }

  return engageDirection(context.arena, {from: context.opponent.position, to: context.target.position, side});
}

function walking(brain: OpponentBrain): boolean {
  return brain.reactionRemainingSeconds <= 0;
}
