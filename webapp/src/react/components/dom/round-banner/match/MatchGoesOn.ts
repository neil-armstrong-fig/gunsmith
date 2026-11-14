import {decideMatch} from "@gunsmith/engine/match/DecideMatch";
import type {Match} from "@gunsmith/engine/match/types/Match";

/** Whether there is a match with a round still to play after this one: when it is true, the banner offers the next round. */
export function matchGoesOn(match: Match | undefined): match is Match {
  return match !== undefined && decideMatch(match) === "playing";
}
