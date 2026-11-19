import {engine} from "@gunsmith/engine/Engine";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import {PRACTICE_ARENA} from "@src/game/practice/PracticeArena";
import {PRACTICE_DUMMIES} from "@src/game/practice/PracticeDummies";
import {worldWithFullAmmunition} from "@src/react/components/dom/workshop/hooks/full-ammunition/WorldWithFullAmmunition";

/**
 * The practice range as it is at the start, but for the player: every dummy stands again at full health where it was put (a felled one included),
 * and both weapons are full (`worldWithFullAmmunition`). The player keeps their place, their aim, their health and the weapon in hand.
 */
export function worldWithRangeReset(world: World): World {
  return {
    ...worldWithFullAmmunition(world),
    dummies: engine.startingWorld(PRACTICE_ARENA, PRACTICE_DUMMIES).dummies,
  };
}
