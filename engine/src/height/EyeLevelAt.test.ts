import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {eyeLevelAt} from "@gunsmith/engine/height/EyeLevelAt";

// Low ground at x 1, a stair at x 2 up to level 1 at x 3, a stair at x 4 up to level 2 at x 5.
const terraces = arenaFrom(["#######", "#.>1>2#", "#######"]);

it("is the level of the ground the viewer stands on", () => {
  expect(eyeLevelAt(terraces, {x: 1.5, y: 1.5})).toBe(0);
  expect(eyeLevelAt(terraces, {x: 3.5, y: 1.5})).toBe(1);
  expect(eyeLevelAt(terraces, {x: 5.5, y: 1.5})).toBe(2);
});

it("is the upper level of the two a stair joins, anywhere on the stair", () => {
  expect(eyeLevelAt(terraces, {x: 2.1, y: 1.5})).toBe(1);
  expect(eyeLevelAt(terraces, {x: 2.9, y: 1.5})).toBe(1);
  expect(eyeLevelAt(terraces, {x: 4.5, y: 1.5})).toBe(2);
});
