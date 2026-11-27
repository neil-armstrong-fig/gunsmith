import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {hidesFrom} from "@gunsmith/engine/opponent/state/acting/reload/cover/HidesFrom";

// One row of floor with a wall at x 4 and a low cover block at x 8; the threat stands at the east end.
const row = arenaFrom(["##############", "#...#...c....#", "##############"]);
const THREAT = {x: 12.5, y: 1.5};

it("hides a place behind a wall", () => {
  expect(hidesFrom(row, THREAT, {x: 2.5, y: 1.5})).toBe(true);
});

it("hides the place right behind a low cover block, where a crouched fighter is out of sight", () => {
  expect(hidesFrom(row, THREAT, {x: 7.5, y: 1.5})).toBe(true);
});

it("does not hide a place farther behind the block than it reaches, which the threat sees over", () => {
  expect(hidesFrom(row, THREAT, {x: 5.5, y: 1.5})).toBe(false);
});

it("does not hide a place in the open", () => {
  expect(hidesFrom(row, THREAT, {x: 10.5, y: 1.5})).toBe(false);
});
