import fc from "fast-check";
import type {Input} from "@gunsmith/engine/game-loop/types/Input";
import {directions} from "@src/online/property-tests/arbitraries/Directions";
import {points} from "@src/online/property-tests/arbitraries/Points";

/**
 * A walk the way a player does it: each ask held for a while (at least `shortestAsk` steps), the keys changing now and then, the aim
 * wandering. The trigger is held in some matches and never in others (`firing`): a shot is the server's to decide (it can end the round),
 * so a property about where the player walks to leaves it out.
 */
export function inputStreams(firing: boolean, shortestAsk = 1): fc.Arbitrary<Input[]> {
  const ask = fc.record({
    direction: directions(),
    crouching: fc.boolean(),
    firing: triggers(firing),
    aimAt: points(0, 8),
  });

  return fc
    .array(fc.tuple(ask, fc.integer({min: shortestAsk, max: 40})), {minLength: 1, maxLength: 12})
    .map(held =>
      held.flatMap(([input, steps]) => Array.from({length: steps}, (): Input => ({...input, reload: false}))),
    );
}

function triggers(held: boolean): fc.Arbitrary<boolean> {
  if (!held) {
    return fc.constant(false);
  }

  return fc.boolean();
}
