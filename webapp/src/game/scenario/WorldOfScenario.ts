import {disarmOpponent} from "@gunsmith/engine/opponent/DisarmOpponent";
import {giveOpponentBrain} from "@gunsmith/engine/opponent/GiveOpponentBrain";
import {engine} from "@gunsmith/engine/Engine";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import {startMatch} from "@gunsmith/engine/match/StartMatch";
import {DUEL_ARENA} from "@src/game/duel/DuelArena";
import {DUEL_OPPONENT} from "@src/game/duel/DuelOpponent";
import {HEIGHTS_ARENA} from "@src/game/heights/HeightsArena";
import {PRACTICE_ARENA} from "@src/game/practice/PracticeArena";
import {PRACTICE_DUMMIES} from "@src/game/practice/PracticeDummies";
import type {Scenario} from "@src/game/scenario/types/Scenario";

/**
 * A fresh game for the scenario: the practice range has its dummies and no opponent, the duel has an opponent with a
 * brain that draws its choices from `seed`, and no dummies, and is the first round of a best-of-three (the only scenario
 * that is a match), and sparring is the duel with an opponent who has no brain and cannot shoot, so it stands and takes
 * it, in one round with no score, and the heights arena is the player alone, with one stair up to a platform.
 */
export function worldOfScenario(scenario: Scenario, seed: number): World {
  if (scenario === "duel") {
    return {...giveOpponentBrain(engine.startingWorld(DUEL_ARENA, [], DUEL_OPPONENT), seed), match: startMatch()};
  }

  if (scenario === "sparring") {
    return disarmOpponent(engine.startingWorld(DUEL_ARENA, [], DUEL_OPPONENT));
  }

  if (scenario === "heights") {
    return engine.startingWorld(HEIGHTS_ARENA);
  }

  return engine.startingWorld(PRACTICE_ARENA, PRACTICE_DUMMIES);
}
