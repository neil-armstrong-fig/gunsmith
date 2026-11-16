import {disarmOpponent} from "@gunsmith/engine/opponent/DisarmOpponent";
import {giveOpponentBrain} from "@gunsmith/engine/opponent/GiveOpponentBrain";
import {engine} from "@gunsmith/engine/Engine";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import {startMatch} from "@gunsmith/engine/match/StartMatch";
import {startRing} from "@gunsmith/engine/ring/StartRing";
import {DEFAULT_RING_TIMING} from "@gunsmith/engine/ring/DefaultRingTiming";
import type {Ring} from "@gunsmith/engine/ring/types/Ring";
import type {RingTiming} from "@gunsmith/engine/ring/types/RingTiming";
import {DUEL_ARENA} from "@src/game/duel/DuelArena";
import {DUEL_OPPONENT} from "@src/game/duel/DuelOpponent";
import {HEIGHTS_ARENA} from "@src/game/heights/HeightsArena";
import {HEIGHTS_DUMMIES} from "@src/game/heights/HeightsDummies";
import {PRACTICE_ARENA} from "@src/game/practice/PracticeArena";
import {PRACTICE_DUMMIES} from "@src/game/practice/PracticeDummies";
import type {Scenario} from "@src/game/scenario/types/Scenario";

/**
 * A fresh game for the scenario: the practice range has its dummies and no opponent, the duel has an opponent with a
 * brain that draws its choices from `seed`, and no dummies, and is the first round of a best-of-three with a ring
 * counting down to its start (the only scenario that is a match, and the only one that always has a ring), and sparring is
 * the duel with an opponent who has no brain and cannot shoot, so it stands and takes it, in one round with no score, and the
 * heights arena is the player and a dummy on each level, with one stair up to a platform.
 *
 * The ring closes on a point drawn from `seed`, and keeps `ringTiming` when the page asked for one (`?ringDelay=`,
 * `?ringClosing=`), otherwise the game's own. Sparring has a ring only when the page asks for ring timing, so a spec can watch
 * the ring alone hurt a fighter who stands still; the practice range and the heights arena never have one.
 */
export function worldOfScenario(scenario: Scenario, seed: number, ringTiming?: RingTiming): World {
  if (scenario === "duel") {
    const world = giveOpponentBrain(engine.startingWorld(DUEL_ARENA, [], DUEL_OPPONENT), seed);

    return {...world, match: startMatch(), ring: ringOf(world, seed, ringTiming ?? DEFAULT_RING_TIMING)};
  }

  if (scenario === "sparring") {
    const world = disarmOpponent(engine.startingWorld(DUEL_ARENA, [], DUEL_OPPONENT));
    if (!ringTiming) {
      return world;
    }

    return {...world, ring: ringOf(world, seed, ringTiming)};
  }

  if (scenario === "heights") {
    return engine.startingWorld(HEIGHTS_ARENA, HEIGHTS_DUMMIES);
  }

  return engine.startingWorld(PRACTICE_ARENA, PRACTICE_DUMMIES);
}

/** The ring for a world that has an opponent: it closes on ground both fighters can walk to from where they start. */
function ringOf(world: World, seed: number, timing: RingTiming): Ring {
  const starts = [world.player.position];
  if (world.opponent) {
    starts.push(world.opponent.position);
  }

  return startRing({arena: world.arena, starts, seed, timing});
}
