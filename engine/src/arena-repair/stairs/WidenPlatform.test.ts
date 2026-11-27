import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {widenPlatform} from "@gunsmith/engine/arena-repair/stairs/WidenPlatform";

const THIN_RING = ["#######", "#.....#", "#.111.#", "#.121.#", "#.111.#", "#.....#", "#######"];
const TOP = [{column: 3, row: 3}];

it("grows the first level one tile out from the second, onto the ground, and draws the ring tile between as a stair climbing onto the top", () => {
  expect(widenPlatform(THIN_RING, TOP)?.[3]).toBe("#1>21.#");
});

it("grows nothing into a wall, and tries the next way out", () => {
  const walledWest = ["#######", "#.....#", "##111.#", "##121.#", "##111.#", "#.....#", "#######"];

  expect(widenPlatform(walledWest, TOP)?.[3]).toBe("##12<1#");
});

it("grows nothing onto a cover block, where the only way out not walled ends in one", () => {
  const coverOut = ["#######", "###c###", "##111##", "##121##", "##111##", "#######"];

  expect(() => arenaFrom(coverOut)).not.toThrow();
  expect(widenPlatform(coverOut, TOP)).toBeUndefined();
});

it("grows nothing onto a stair, where the only way out not walled ends in one", () => {
  const stairOut = ["#######", "##111##", "##121##", "##111##", "###^###", "###.###", "#######"];

  expect(() => arenaFrom(stairOut)).not.toThrow();
  expect(widenPlatform(stairOut, [{column: 3, row: 2}])).toBeUndefined();
});

it("leaves a first level to a single stair from the ground", () => {
  const plateau = ["#######", "#.....#", "#..1..#", "#.....#", "#######"];

  expect(widenPlatform(plateau, [{column: 3, row: 2}])).toBeUndefined();
});

it("draws nothing beside a second level that does not stand on a first", () => {
  const tower = ["#######", "#.....#", "#..2..#", "#.....#", "#######"];

  expect(widenPlatform(tower, [{column: 3, row: 2}])).toBeUndefined();
});
