import {disarmOpponent} from "@gunsmith/engine/opponent/DisarmOpponent";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import {DUEL_ARENA} from "@src/game/duel/DuelArena";
import {DUEL_OPPONENT} from "@src/game/duel/DuelOpponent";
import {PRACTICE_ARENA} from "@src/game/practice/PracticeArena";
import {PRACTICE_DUMMIES} from "@src/game/practice/PracticeDummies";
import type {Scenario} from "@src/game/scenario/types/Scenario";

/**
 * A fresh match for the scenario: the practice range has its dummies and no opponent, the duel has an opponent and no
 * dummies, and sparring is the duel with an opponent who cannot shoot.
 */
export function worldOfScenario(scenario: Scenario): World {
  if (scenario === "duel") {
    return startingWorld(DUEL_ARENA, [], DUEL_OPPONENT);
  }

  if (scenario === "sparring") {
    return disarmOpponent(startingWorld(DUEL_ARENA, [], DUEL_OPPONENT));
  }

  return startingWorld(PRACTICE_ARENA, PRACTICE_DUMMIES);
}
