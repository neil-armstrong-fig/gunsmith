import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {solidTilesOf} from "@gunsmith/engine/arena/SolidTilesOf";
import {isSolid} from "@gunsmith/engine/arena/IsSolid";
import {waypointToward} from "@gunsmith/engine/opponent/shelter/waypoint/WaypointToward";
import {hasClearLine} from "@gunsmith/engine/vision/sight/HasClearLine";

// A pillar three tiles tall (x from 8 to 10, y from 3 to 6) stands between the east and the west.
const pillared = arenaFrom([
  "####################",
  "#..................#",
  "#..................#",
  "#........##........#",
  "#........##........#",
  "#........##........#",
  "#..................#",
  "#..................#",
  "####################",
]);
const EAST = {x: 14.5, y: 4.5};
const WEST = {x: 3.5, y: 4.5};

it("goes straight for the target when nothing is in the way", () => {
  const target = {x: 14.5, y: 1.5};

  expect(waypointToward(pillared, EAST, target)).toEqual(target);
});

it("goes round a pillar: a place it can walk to in a straight line, from which the target is in clear sight", () => {
  const waypoint = waypointToward(pillared, EAST, WEST);
  const solid = solidTilesOf(pillared);

  expect(waypoint).not.toEqual(WEST);
  expect(isSolid(pillared, Math.floor(waypoint.x), Math.floor(waypoint.y))).toBe(false);
  expect(hasClearLine(solid, EAST, waypoint)).toBe(true);
  expect(hasClearLine(solid, waypoint, WEST)).toBe(true);
});

it("goes round the pillar the same way from the same place", () => {
  expect(waypointToward(pillared, EAST, WEST)).toEqual(waypointToward(pillared, EAST, WEST));
});

it("takes the place that is nearest the target of those that see it", () => {
  const waypoint = waypointToward(pillared, EAST, WEST);
  const lateral = Math.abs(waypoint.y - EAST.y);

  // A step of 1.5 tiles north or south clears the pillar's face; a longer one is farther from the target.
  expect(Math.hypot(waypoint.x - WEST.x, waypoint.y - WEST.y)).toBeLessThan(
    Math.hypot(EAST.x - WEST.x, EAST.y - WEST.y),
  );
  expect(lateral).toBeGreaterThan(0);
});

it("makes for the nearest place to the target it can walk to when none of them can see it", () => {
  const room = arenaFrom(["#####", "#...#", "#####"]);
  const from = {x: 1.5, y: 1.5};
  const target = {x: 20, y: 1.5};
  const waypoint = waypointToward(room, from, target);

  expect(hasClearLine(solidTilesOf(room), from, waypoint)).toBe(true);
  expect(waypoint.x).toBeGreaterThan(from.x);
  expect(waypoint.x).toBeLessThan(4);
});

it("falls back to the target when there is nowhere it can walk to", () => {
  const cell = arenaFrom(["###", "#.#", "###"]);
  const target = {x: 20, y: 20};

  expect(waypointToward(cell, {x: 1.5, y: 1.5}, target)).toEqual(target);
});
