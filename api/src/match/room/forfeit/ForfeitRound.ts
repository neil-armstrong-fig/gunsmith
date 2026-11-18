import type {World} from "@gunsmith/engine/game-loop/types/World";
import {scoreRound} from "@gunsmith/engine/match/ScoreRound";
import type {Seat} from "@gunsmith/engine/seat/types/Seat";
import type {RoundState} from "@gunsmith/engine/round/types/RoundState";

/**
 * The world once `seat`'s person has forfeited the round being fought: the round goes to the other seat and is scored for them, as a
 * round won by a shot is (the world's `round` is the first seat's side, as the engine has it). Both fighters stay where they stand. A round
 * already decided is returned as it is, so one forfeit cannot be scored twice.
 */
export function forfeitRound(world: World, seat: Seat): World {
  if (world.round !== "playing") {
    return world;
  }
  if (seat === "first") {
    return decided(world, "lost");
  }

  return decided(world, "won");
}

function decided(world: World, round: RoundState): World {
  return {...world, round, match: world.match && scoreRound(world.match, round), events: undefined};
}
