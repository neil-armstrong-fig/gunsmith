import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {tilesBesideCover} from "@gunsmith/engine/cover/TilesBesideCover";

// Open floor with two low cover blocks side by side in the middle row and a wall tile touching the east one.
const yard = arenaFrom(["#######", "#.....#", "#.cc#.#", "#.....#", "#######"]);
const EVERYWHERE = {centre: {x: 3.5, y: 2.5}, radius: 100};

it("lists each open tile around the blocks once, leaving out the blocks and the wall", () => {
  const tiles = tilesBesideCover(yard, EVERYWHERE);
  const keys = tiles.map(tile => `${tile.x},${tile.y}`);

  expect(new Set(keys).size).toBe(tiles.length);
  expect([...keys].sort()).toEqual(["1,1", "1,2", "1,3", "2,1", "2,3", "3,1", "3,3", "4,1", "4,3"]);
});

it("leaves out the tiles of a block whose middle lies outside the circle", () => {
  const aroundTheWestBlock = {centre: {x: 2.5, y: 2.5}, radius: 0.9};
  const keys = tilesBesideCover(yard, aroundTheWestBlock).map(tile => `${tile.x},${tile.y}`);

  expect(keys).toContain("1,2");
  expect(keys).not.toContain("4,1");
});

it("lists nothing in an arena with no cover", () => {
  expect(tilesBesideCover(arenaFrom(["#####", "#...#", "#####"]), EVERYWHERE)).toEqual([]);
});
