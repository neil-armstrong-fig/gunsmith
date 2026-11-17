import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {equippedWeapon} from "@gunsmith/engine/loadout/EquippedWeapon";
import {aimErrorFor} from "@gunsmith/engine/opponent/state/acting/engage/aim/AimErrorFor";
import {missedAimPoint} from "@gunsmith/engine/opponent/state/acting/engage/aim/MissedAimPoint";
import {advanceBurst} from "@gunsmith/engine/opponent/state/acting/engage/AdvanceBurst";
import {advanceStrafe} from "@gunsmith/engine/opponent/state/acting/engage/AdvanceStrafe";
import {engageDirection} from "@gunsmith/engine/opponent/state/acting/engage/EngageDirection";
import type {OpponentBrain} from "@gunsmith/engine/opponent/types/OpponentBrain";
import type {OpponentContext} from "@gunsmith/engine/opponent/types/OpponentContext";
import type {StateAct} from "@gunsmith/engine/opponent/types/StateAct";
import type {StrafeSide} from "@gunsmith/engine/opponent/types/StrafeSide";

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

  return {
    input: {
      direction: heading(brain, context, burst.brain.strafeSide),
      aimAt: missedAimPoint(opponent.position, target.position, error),
      firing: burst.firing,
      reload: false,
    },
    brain: burst.brain,
  };
}

/** Where it walks: nowhere while it waits out its reaction time, then the way `engageDirection` says. */
function heading(brain: OpponentBrain, context: OpponentContext, side: StrafeSide): Point {
  if (!walking(brain)) {
    return {x: 0, y: 0};
  }

  return engageDirection(context.arena, {from: context.opponent.position, to: context.target.position, side});
}

function walking(brain: OpponentBrain): boolean {
  return brain.reactionRemainingSeconds <= 0;
}
