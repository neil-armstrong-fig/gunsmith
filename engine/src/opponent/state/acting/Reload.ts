import {coverBesideTarget} from "@gunsmith/engine/cover/CoverBesideTarget";
import {equippedWeapon} from "@gunsmith/engine/loadout/EquippedWeapon";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {findCover} from "@gunsmith/engine/opponent/state/acting/reload/cover/FindCover";
import {advanceStrafe} from "@gunsmith/engine/opponent/state/acting/engage/AdvanceStrafe";
import {otherLoadedSlot} from "@gunsmith/engine/opponent/state/acting/reload/OtherLoadedSlot";
import {routeWaypoint} from "@gunsmith/engine/opponent/steering/RouteWaypoint";
import {strafeDirection} from "@gunsmith/engine/opponent/steering/StrafeDirection";
import {walkToward} from "@gunsmith/engine/opponent/steering/WalkToward";
import type {OpponentBrain} from "@gunsmith/engine/opponent/types/OpponentBrain";
import type {OpponentContext} from "@gunsmith/engine/opponent/types/OpponentContext";
import type {StateAct} from "@gunsmith/engine/opponent/types/StateAct";

/**
 * Reloading: the magazine is empty. It asks for a reload every step (asking again mid-reload changes nothing), and
 * while the player can see it, it makes for the nearest cover it can walk to (round by a stair where there is a drop, `routeWaypoint`),
 * or circles in the open when there is none. A cover block already beside it on the line to the player is cover enough: it crouches
 * and holds still there. Out of the player's sight it reloads where it stands. A weapon with no rounds and no reserve cannot
 * be reloaded, so it asks for its other weapon instead. It never fires. Leaving is `chooseState`'s business: once the
 * magazine has rounds again.
 */
export function actReload(brain: OpponentBrain, context: OpponentContext): StateAct {
  const planned = plan(brain, context);
  const fallback = fallbackSlot(context);

  return {
    input: {
      direction: direction(planned, context),
      aimAt: aimedAt(planned, context),
      firing: false,
      crouching: isDucking(planned, context),
      reload: fallback === undefined,
      switchTo: fallback,
    },
    brain: planned,
  };
}

function plan(brain: OpponentBrain, context: OpponentContext): OpponentBrain {
  if (!context.sees || isDucking(brain, context)) {
    return brain;
  }

  const covered = chooseCover(brain, context);
  if (covered.goal) {
    return covered;
  }

  return advanceStrafe(covered, context.seconds);
}

function chooseCover(brain: OpponentBrain, context: OpponentContext): OpponentBrain {
  if (brain.goal) {
    return brain;
  }
  const draw = findCover(context.arena, {
    from: context.opponent.position,
    threat: context.target.position,
    seed: brain.seed,
  });

  return {...brain, seed: draw.seed, goal: draw.cover};
}

function aimedAt(brain: OpponentBrain, context: OpponentContext): Point | undefined {
  if (context.sees) {
    return context.target.position;
  }

  return brain.goal;
}

function fallbackSlot(context: OpponentContext): number | undefined {
  const carried = equippedWeapon(context.opponent);
  if (carried.rounds > 0 || carried.reserve > 0) {
    return undefined;
  }

  return otherLoadedSlot(context.opponent);
}

function direction(brain: OpponentBrain, context: OpponentContext): Point {
  const {opponent, target, sees} = context;
  if (brain.goal) {
    return walkToward(opponent.position, routeWaypoint(context.arena, opponent.position, brain.goal));
  }

  if (isDucking(brain, context)) {
    return {x: 0, y: 0};
  }

  if (sees) {
    return strafeDirection({from: opponent.position, to: target.position, side: brain.strafeSide});
  }

  return {x: 0, y: 0};
}

/** Whether it crouches where it stands: the player sees it, it has no other cover to walk to, and a cover block stands beside it on the line to them. */
function isDucking(brain: OpponentBrain, context: OpponentContext): boolean {
  if (!context.sees || brain.goal) {
    return false;
  }

  return coverBesideTarget(context.arena, context.target.position, context.opponent.position);
}
