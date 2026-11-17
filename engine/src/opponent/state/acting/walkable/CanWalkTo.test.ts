import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {canWalkTo} from "@gunsmith/engine/opponent/state/acting/walkable/CanWalkTo";

const withStair = arenaFrom(["##########", "#...>1111#", "#....1111#", "##########"]);
const PILLARED = arenaFrom(["#######", "#.....#", "#..#..#", "#.....#", "#######"]);

it("is true for a straight, clear walk on the same level", () => {
  expect(canWalkTo(withStair, {x: 1.5, y: 1.5}, {x: 3.5, y: 1.5})).toBe(true);
});

it("in an arena with no stair asks only that no wall stand in the straight line, as the opponent always has", () => {
  expect(canWalkTo(PILLARED, {x: 1.5, y: 2.5}, {x: 5.5, y: 2.5})).toBe(false);
  expect(canWalkTo(PILLARED, {x: 1.5, y: 1.5}, {x: 5.5, y: 1.5})).toBe(true);
});

it("is true across a drop when a stair makes the way, though the straight line crosses the drop", () => {
  expect(canWalkTo(withStair, {x: 1.5, y: 1.5}, {x: 7.5, y: 1.5})).toBe(true);
  expect(canWalkTo(withStair, {x: 7.5, y: 1.5}, {x: 1.5, y: 1.5})).toBe(true);
});

it("is false across a drop that no stair crosses, in an arena that has a stair elsewhere", () => {
  const upperPlatform = arenaFrom(["############", "#...>111222#", "#....111222#", "############"]);

  expect(canWalkTo(upperPlatform, {x: 1.5, y: 1.5}, {x: 9.5, y: 1.5})).toBe(false);
  expect(canWalkTo(upperPlatform, {x: 1.5, y: 1.5}, {x: 6.5, y: 1.5})).toBe(true);
});

it("is false for a goal in a wall", () => {
  expect(canWalkTo(withStair, {x: 1.5, y: 1.5}, {x: 0.5, y: 0.5})).toBe(false);
});
