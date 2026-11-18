import type {LandedHit} from "@gunsmith/engine/bullet/types/LandedHit";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import {visibleHitsOf} from "@gunsmith/engine/game-loop/visible-hits/VisibleHitsOf";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import {arena} from "@gunsmith/engine/game-loop/step/testing/Arena";

const OPPONENT_HIT: LandedHit = {on: "opponent", dummyIndex: undefined};

// The player stands at 7.5, 4.5 facing east: the opponent at 11.5 and the dummy at 10.5 are in front, the one at 3.5 behind.
const IN_FRONT = {x: 10.5, y: 4.5};
const BEHIND = {x: 3.5, y: 4.5};

it("has no visible hits when nothing landed", () => {
  expect(visibleHitsOf(lookingEast(), [])).toEqual([]);
});

it("keeps a hit on the opponent the player sees", () => {
  expect(visibleHitsOf(lookingEast(), [OPPONENT_HIT])).toEqual(["opponent"]);
});

it("drops a hit on the opponent the player does not see", () => {
  expect(visibleHitsOf(lookingWest(), [OPPONENT_HIT])).toEqual([]);
});

it("keeps a hit on a dummy the player sees, going by its place in the list", () => {
  expect(visibleHitsOf(lookingEast(), [{on: "dummy", dummyIndex: 0}])).toEqual(["dummy"]);
});

it("drops a hit on a dummy the player does not see, though another dummy is in sight", () => {
  expect(visibleHitsOf(lookingEast(), [{on: "dummy", dummyIndex: 1}])).toEqual([]);
});

it("drops a hit on a dummy that has no place in the list", () => {
  expect(
    visibleHitsOf(lookingEast(), [
      {on: "dummy", dummyIndex: undefined},
      {on: "dummy", dummyIndex: 7},
    ]),
  ).toEqual([]);
});

it("keeps each visible hit in order and drops the hidden ones between them", () => {
  const hits: LandedHit[] = [OPPONENT_HIT, {on: "dummy", dummyIndex: 1}, {on: "dummy", dummyIndex: 0}, OPPONENT_HIT];

  expect(visibleHitsOf(lookingEast(), hits)).toEqual(["opponent", "dummy", "opponent"]);
});

it("drops a hit on an opponent that is not in the world", () => {
  expect(visibleHitsOf({...lookingEast(), opponent: undefined}, [OPPONENT_HIT])).toEqual([]);
});

function lookingWest(): World {
  const world = lookingEast();

  return {...world, player: {...world.player, aim: {x: -1, y: 0}}};
}

function lookingEast(): World {
  return startingWorld(arena, [IN_FRONT, BEHIND], {x: 11.5, y: 4.5});
}
