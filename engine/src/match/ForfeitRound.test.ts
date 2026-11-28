import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {DUEL_BUILT_IN_ARENA} from "@gunsmith/engine/arena/built-in/DuelBuiltInArena";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import {startMatch} from "@gunsmith/engine/match/StartMatch";
import {forfeitRound} from "@gunsmith/engine/match/ForfeitRound";

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

it("drops the events of the step it ends, as they belong to a round that was not shot out", () => {
  const fighting: World = {...roundBeingFought(), events: [{kind: "fireRefused", reason: "empty"}]};

  expect(forfeitRound(fighting, "first").events).toBeUndefined();
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
  return {...startingWorld(arenaFrom(DUEL_BUILT_IN_ARENA.rows), [], {x: 16.5, y: 6.5}), match: startMatch()};
}
