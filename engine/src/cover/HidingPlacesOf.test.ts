import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {isSolid} from "@gunsmith/engine/arena/IsSolid";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import {coverBesideTarget} from "@gunsmith/engine/cover/CoverBesideTarget";
import {hidingPlacesOf} from "@gunsmith/engine/cover/HidingPlacesOf";
import type {HidingPlace} from "@gunsmith/engine/cover/types/HidingPlace";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {canSeePoint} from "@gunsmith/engine/vision/sight/CanSeePoint";
import type {Cone} from "@gunsmith/engine/vision/types/Cone";

// One row of low ground, x 1 to 11, with a cover block filling the tile from x 3 to 4.
const row = arenaFrom(["#############", "#..c........#", "#############"]);
const yard = arenaFrom([
  "###############",
  "#.............#",
  "#.............#",
  "#.....c.......#",
  "#.............#",
  "#.......c.....#",
  "#.............#",
  "###############",
]);

it("shades the floor within a tile behind a block, as seen from the player, and nothing else on the row", () => {
  const places = hidingPlacesOf(row, standingAt({x: 1.5, y: 1.5}, {x: 1, y: 0}));

  expect(extentOf(places)).toEqual([4, 5, 1, 2]);
  expect(places.length).toBe(16);
});

it("shades no floor in front of the block, or beyond a tile behind it", () => {
  const places = hidingPlacesOf(row, standingAt({x: 1.5, y: 1.5}, {x: 1, y: 0}));

  expect(places.some(place => place.x < 4)).toBe(false);
  expect(places.some(place => place.x >= 5)).toBe(false);
});

it("shades nothing in an arena with no cover, where a wall hides by blocking sight", () => {
  const walled = arenaFrom(["#############", "#..#........#", "#############"]);

  expect(hidingPlacesOf(walled, standingAt({x: 1.5, y: 1.5}, {x: 1, y: 0}))).toEqual([]);
});

it("shades only floor the player sees, so a block out of view shades nothing", () => {
  expect(hidingPlacesOf(row, standingAt({x: 1.5, y: 1.5}, {x: -1, y: 0}))).toEqual([]);
});

it("shades nothing beyond the cone's reach", () => {
  const near = {...standingAt({x: 1.5, y: 1.5}, {x: 1, y: 0}), range: 2};

  expect(hidingPlacesOf(row, near)).toEqual([]);
});

it("shades the floor on the far side of the block from where the player stands, whichever side that is", () => {
  const fromTheEast = hidingPlacesOf(row, standingAt({x: 8.5, y: 1.5}, {x: -1, y: 0}));

  expect(extentOf(fromTheEast)).toEqual([2, 3, 1, 2]);
});

it("shades a place exactly where a crouched fighter would be hidden from the player, in a yard with two blocks", () => {
  const cone = standingAt({x: 1.5, y: 2.5}, {x: 1, y: 0});
  const shaded = hidingPlacesOf(yard, cone);

  expect(shaded.length).toBeGreaterThan(0);
  expect(shaded.map(centreOf).sort(byPlace)).toEqual(expectedCentres(yard, cone).sort(byPlace));
});

it("never shades a wall or a block", () => {
  const cone = standingAt({x: 1.5, y: 2.5}, {x: 1, y: 0});

  for (const place of hidingPlacesOf(yard, cone)) {
    expect(isSolid(yard, Math.floor(centreOf(place).x), Math.floor(centreOf(place).y))).toBe(false);
  }
});

it("shades each place once", () => {
  const cone = standingAt({x: 1.5, y: 2.5}, {x: 1, y: 0});
  const keys = hidingPlacesOf(yard, cone).map(place => `${place.x},${place.y}`);

  expect(new Set(keys).size).toBe(keys.length);
});

function standingAt(apex: Point, aim: Point): Cone {
  return {apex, aim, halfAngleRadians: Math.PI / 4, range: 12, eyeLevel: 0, crouching: false};
}

/** The west, east, south and north edges of all the places together. */
function extentOf(places: readonly HidingPlace[]): number[] {
  return [
    Math.min(...places.map(place => place.x)),
    Math.max(...places.map(place => place.x + place.size)),
    Math.min(...places.map(place => place.y)),
    Math.max(...places.map(place => place.y + place.size)),
  ];
}

function centreOf(place: HidingPlace): Point {
  return {x: place.x + place.size / 2, y: place.y + place.size / 2};
}

// The same question asked of every quarter-tile of the arena, with no thought for where blocks are: the answer the shading must agree with.
function expectedCentres(arena: Arena, cone: Cone): Point[] {
  const centres: Point[] = [];
  for (let step = 0; step < arena.width * 4 * arena.height * 4; step++) {
    const centre = {x: ((step % (arena.width * 4)) + 0.5) / 4, y: (Math.floor(step / (arena.width * 4)) + 0.5) / 4};
    if (
      !isSolid(arena, Math.floor(centre.x), Math.floor(centre.y)) &&
      canSeePoint(arena, cone, centre) &&
      coverBesideTarget(arena, cone.apex, centre)
    ) {
      centres.push(centre);
    }
  }

  return centres;
}

function byPlace(first: Point, second: Point): number {
  return first.y - second.y || first.x - second.x;
}
