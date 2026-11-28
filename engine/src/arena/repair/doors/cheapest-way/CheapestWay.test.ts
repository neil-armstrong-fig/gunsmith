import {cheapestWay} from "@gunsmith/engine/arena/repair/doors/cheapest-way/CheapestWay";

it("goes through one wall tile rather than two, and returns the tiles walked from the first piece of floor to the second", () => {
  const rows = ["#######", "#.#.#.#", "#.#.#.#", "#######"];

  const way = cheapestWay(rows, {from: [{column: 1, row: 1}], to: [{column: 3, row: 1}]});

  expect(way).toEqual([
    {column: 1, row: 1},
    {column: 2, row: 1},
    {column: 3, row: 1},
  ]);
});

it("takes a longer way over floor in preference to cutting a wall", () => {
  const rows = ["#####", "#.#.#", "#...#", "#####"];

  const way = cheapestWay(rows, {from: [{column: 1, row: 1}], to: [{column: 3, row: 1}]});

  expect(way?.length).toBe(5);
  expect(way?.every(tile => rows[tile.row]?.[tile.column] === ".")).toBe(true);
});

it("cuts a wall before a platform, because the wall costs less", () => {
  const rows = ["#######", "#..#1.#", "#..#1.#", "#..#..#", "#######"];

  const way = cheapestWay(rows, {from: [{column: 1, row: 1}], to: [{column: 5, row: 3}]});

  expect(way).toContainEqual({column: 3, row: 3});
  expect(way?.some(tile => rows[tile.row]?.[tile.column] === "1")).toBe(false);
});

it("never crosses the border of the drawing, even when that is the only way", () => {
  const rows = ["#####", "#.#.#", "#####"];

  expect(cheapestWay(rows, {from: [{column: 1, row: 1}], to: [{column: 3, row: 1}]})).toEqual([
    {column: 1, row: 1},
    {column: 2, row: 1},
    {column: 3, row: 1},
  ]);
  expect(cheapestWay(["###", "#.#", "###"], {from: [{column: 1, row: 1}], to: [{column: 0, row: 1}]})).toBeUndefined();
});

it("does not cut through a stair, even when that is the only way", () => {
  const rows = ["#####", "#.>.#", "#####"];

  expect(cheapestWay(rows, {from: [{column: 1, row: 1}], to: [{column: 3, row: 1}]})).toBeUndefined();
});

it("never cuts through a platform, even when that is the only way", () => {
  const rows = ["#######", "#..1..#", "#..1..#", "#######"];
  const pocket = [
    {column: 1, row: 1},
    {column: 2, row: 1},
    {column: 1, row: 2},
    {column: 2, row: 2},
  ];
  const arena = [
    {column: 4, row: 1},
    {column: 5, row: 1},
    {column: 4, row: 2},
    {column: 5, row: 2},
  ];

  expect(cheapestWay(rows, {from: pocket, to: arena})).toBeUndefined();
});
