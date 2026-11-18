import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import {startMatch} from "@gunsmith/engine/match/StartMatch";
import {MATCH_ARENA_ROWS} from "@src/match/room/arena/MatchArenaRows";
import {forfeitRound} from "@src/match/room/forfeit/ForfeitRound";

it("gives the round to the second seat when the first forfeits, and scores it for them", () => {
  const world = forfeitRound(roundBeingFought(), "first");

  expect(world.round).toBe("lost");
  expect(world.match).toEqual({playerWins: 0, opponentWins: 1, roundNumber: 1});
});

it("gives the round to the first seat when the second forfeits, and scores it for them", () => {
  const world = forfeitRound(roundBeingFought(), "second");

  expect(world.round).toBe("won");
  expect(world.match).toEqual({playerWins: 1, opponentWins: 0, roundNumber: 1});
});

it("leaves both fighters where they stand", () => {
  const before = roundBeingFought();
  const after = forfeitRound(before, "first");

  expect(after.player).toEqual(before.player);
  expect(after.opponent).toEqual(before.opponent);
});

it("does not score a round that is already decided a second time", () => {
  const decided = forfeitRound(roundBeingFought(), "first");

  expect(forfeitRound(decided, "second")).toEqual(decided);
});

it("decides a round that belongs to no match without inventing a score", () => {
  const world = forfeitRound({...roundBeingFought(), match: undefined}, "first");

  expect(world.round).toBe("lost");
  expect(world.match).toBeUndefined();
});

function roundBeingFought(): World {
  return {...startingWorld(arenaFrom(MATCH_ARENA_ROWS), [], {x: 16.5, y: 6.5}), match: startMatch()};
}
