import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {hasStairs} from "@gunsmith/engine/arena/HasStairs";

it("is true for an arena with a stair", () => {
  expect(hasStairs(arenaFrom(["#####", "#.>1#", "#####"]))).toBe(true);
});

it("is false for an arena with none, raised floor or not", () => {
  expect(hasStairs(arenaFrom(["####", "#..#", "####"]))).toBe(false);
  expect(hasStairs(arenaFrom(["####", "#.1#", "####"]))).toBe(false);
});
