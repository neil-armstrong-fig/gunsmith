import {aimPlayer} from "@gunsmith/engine/player/AimPlayer";

const EAST = {x: 1, y: 0};
const FROM = {x: 4, y: 4};

it("faces the target", () => {
  expect(aimPlayer(EAST, FROM, {x: 4, y: 9})).toEqual({x: 0, y: 1});
});

it("faces a target to the west", () => {
  expect(aimPlayer(EAST, FROM, {x: 0, y: 4})).toEqual({x: -1, y: 0});
});

it("gives a direction of length one however far the target is", () => {
  const aim = aimPlayer(EAST, FROM, {x: 400, y: 300});

  expect(Math.hypot(aim.x, aim.y)).toBeCloseTo(1, 12);
});

it("points along a diagonal when the target is on one", () => {
  const aim = aimPlayer(EAST, FROM, {x: 7, y: 7});

  expect(aim.x).toBeCloseTo(Math.SQRT1_2, 12);
  expect(aim.y).toBeCloseTo(Math.SQRT1_2, 12);
});

it("keeps the previous aim when the target is exactly on the player", () => {
  expect(aimPlayer({x: 0, y: -1}, FROM, FROM)).toEqual({x: 0, y: -1});
});

it("keeps the previous aim when there is no target", () => {
  expect(aimPlayer({x: 0, y: -1}, FROM, undefined)).toEqual({x: 0, y: -1});
});
