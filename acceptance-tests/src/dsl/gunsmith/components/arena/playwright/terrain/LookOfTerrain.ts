import type {Page} from "@playwright/test";
import type {TerrainLook} from "@src/dsl/gunsmith/components/arena/types/TerrainLook";
import {coloursAtTiles} from "@src/dsl/gunsmith/playwright/screen/ColoursAtTiles";
import type {Point} from "@src/dsl/gunsmith/types/Point";

const FLOOR_COLUMNS = [2, 5, 9];
const MARK_AND_GAP_X = [8, 10, 14, 16, 20, 26];
const DESIGN_PIXELS_PER_TILE = 64;

export async function lookOfTerrain(page: Page, pixelsPerTile: number): Promise<TerrainLook> {
  const floorFills = FLOOR_COLUMNS.map(column => terrainPoint(column, 32, 24));
  const floorMarks = FLOOR_COLUMNS.flatMap(column => MARK_AND_GAP_X.map(x => terrainPoint(column, x, 12)));
  const joinAndWall = [
    terrainPoint(1, 58, 30),
    terrainPoint(1, DESIGN_PIXELS_PER_TILE - DESIGN_PIXELS_PER_TILE / pixelsPerTile, 30),
    terrainPoint(2, 4, 30),
    terrainPoint(0, 32, 32),
    terrainPoint(0, 8, 13),
  ];
  const stairBands = [8, 24, 40, 56].map(x => terrainPoint(7, x, 32));
  const stairTreads = [3, 7].flatMap(column => [16, 32, 48].map(x => terrainPoint(column, x, 32)));
  const landingRails = [3, 7].flatMap(column =>
    [4, 58].flatMap(y => [terrainPoint(column - 1, 54, y), terrainPoint(column + 1, 10, y)]),
  );
  const stairEntrances = [3, 7].flatMap(column => [terrainPoint(column, 0, 32), terrainPoint(column + 1, 2, 32)]);
  const dropEdge = [
    {x: 7.85, y: 4.3},
    {x: 8.03125, y: 4.3},
    {x: 8.45, y: 4.3},
    {x: 7.75, y: 4.3},
    {x: 8.0625, y: 4.3},
  ];
  const colours = await coloursAtTiles(page, [
    ...floorFills,
    ...floorMarks,
    ...joinAndWall,
    ...stairBands,
    ...stairTreads,
    ...landingRails,
    ...stairEntrances,
    ...dropEdge,
  ]);
  const greens = colours.map(colour => colour.green);

  return {
    floorFills: greens.splice(0, floorFills.length),
    floorMarks: FLOOR_COLUMNS.map(() => greens.splice(0, MARK_AND_GAP_X.length)),
    joinAndWall: greens.splice(0, joinAndWall.length),
    stairBands: greens.splice(0, stairBands.length),
    stairTreads: greens.splice(0, stairTreads.length),
    landingRails: greens.splice(0, landingRails.length),
    stairEntrances: greens.splice(0, stairEntrances.length),
    dropEdge: greens,
  };
}

// The sampled row is y = 3. Convert the screen-up SVG coordinates to arena coordinates.
function terrainPoint(column: number, x: number, y: number): Point {
  return {x: column + x / DESIGN_PIXELS_PER_TILE, y: 4 - y / DESIGN_PIXELS_PER_TILE};
}
