import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {blockedFrom} from "@gunsmith/engine/height/BlockedFrom";

// Row y = 1 climbs: low ground at x 1, a stair at x 2, a platform at x 3, a second stair at x 4 and a high platform at x 5.
// Row y = 2 is low ground the whole way along, so it runs level with the platform's side.
const arena = arenaFrom(["#######", "#.....#", "#.>1>2#", "#######"]);
const LOW_GROUND = {x: 1.5, y: 1.5};
const PLATFORM = {x: 3.5, y: 1.5};
const HIGH_PLATFORM = {x: 5.5, y: 1.5};
const FIRST_STAIR = {x: 2, y: 1};
const SECOND_STAIR = {x: 4, y: 1};

it("blocks a wall, from anywhere", () => {
  expect(blockedFrom(arena, LOW_GROUND)(0, 1)).toBe(true);
  expect(blockedFrom(arena, PLATFORM)(3, 0)).toBe(true);
});

it("lets a walker on the low ground into more low ground", () => {
  expect(blockedFrom(arena, LOW_GROUND)(1, 2)).toBe(false);
});

it("blocks a walker on the low ground from a platform: the edge is a drop", () => {
  expect(blockedFrom(arena, LOW_GROUND)(3, 1)).toBe(true);
});

it("lets a walker on the low ground onto the stair that climbs from it", () => {
  expect(blockedFrom(arena, LOW_GROUND)(FIRST_STAIR.x, FIRST_STAIR.y)).toBe(false);
});

it("lets a walker on the platform onto the stair down and the stair up", () => {
  expect(blockedFrom(arena, PLATFORM)(FIRST_STAIR.x, FIRST_STAIR.y)).toBe(false);
  expect(blockedFrom(arena, PLATFORM)(SECOND_STAIR.x, SECOND_STAIR.y)).toBe(false);
});

it("blocks a walker on the platform from the low ground and from the high platform, which only a stair reaches", () => {
  expect(blockedFrom(arena, PLATFORM)(1, 2)).toBe(true);
  expect(blockedFrom(arena, PLATFORM)(5, 1)).toBe(true);
});

it("blocks a walker on the low ground from the stair between the platform and the high platform", () => {
  expect(blockedFrom(arena, LOW_GROUND)(SECOND_STAIR.x, SECOND_STAIR.y)).toBe(true);
});

it("blocks a walker on the high platform from the stair between the low ground and the platform", () => {
  expect(blockedFrom(arena, HIGH_PLATFORM)(FIRST_STAIR.x, FIRST_STAIR.y)).toBe(true);
});

it("lets a walker standing on a stair go to either landing", () => {
  const onTheStair = {x: 2.5, y: 1.5};

  expect(blockedFrom(arena, onTheStair)(1, 1)).toBe(false);
  expect(blockedFrom(arena, onTheStair)(3, 1)).toBe(false);
});

it("still blocks a walker standing on a stair from a level neither of its ends is on", () => {
  const onTheStair = {x: 2.5, y: 1.5};

  expect(blockedFrom(arena, onTheStair)(5, 1)).toBe(true);
});
