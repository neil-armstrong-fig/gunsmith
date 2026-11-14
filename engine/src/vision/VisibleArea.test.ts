import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import {isInCone} from "@gunsmith/engine/vision/cone/IsInCone";
import {visibleArea} from "@gunsmith/engine/vision/VisibleArea";
import type {Cone} from "@gunsmith/engine/vision/types/Cone";

// A room 31 tiles square, with the floor as wide as the cone needs; `column` is the x of a wall across it, if any.
function room(column?: number): Arena {
  const rows = Array.from({length: 31}, (_, y) => {
    if (y === 0 || y === 30) {
      return "#".repeat(31);
    }

    return Array.from({length: 31}, (_, x) => (x === 0 || x === 30 || x === column ? "#" : ".")).join("");
  });

  return arenaFrom(rows);
}

const open = room();
// A wall across the room whose face is at x = 9, three and a half tiles east of the apex.
const walled = room(9);

const EAST: Cone = {apex: {x: 5.5, y: 15.5}, aim: {x: 1, y: 0}, halfAngleRadians: Math.PI / 4, range: 10};

it("starts at the apex", () => {
  expect(visibleArea(open, EAST)[0]).toEqual(EAST.apex);
});

it("reaches the full range straight ahead when nothing is in the way", () => {
  const reach = visibleArea(open, EAST)
    .slice(1)
    .map(point => Math.hypot(point.x - EAST.apex.x, point.y - EAST.apex.y));

  expect(Math.max(...reach)).toBeCloseTo(EAST.range, 6);
});

it("stays inside the cone", () => {
  expect(visibleArea(open, EAST).every(point => isInCone({...EAST, range: EAST.range + 1e-6}, point))).toBe(true);
});

it("covers the whole width of the cone", () => {
  const edges = visibleArea(open, EAST).slice(1);
  const first = edges[0];
  const last = edges[edges.length - 1];

  expect(first?.y).toBeCloseTo(EAST.apex.y - Math.sin(Math.PI / 4) * EAST.range, 6);
  expect(last?.y).toBeCloseTo(EAST.apex.y + Math.sin(Math.PI / 4) * EAST.range, 6);
});

it("stops exactly at the face of a wall instead of reaching through it", () => {
  const straightAhead = visibleArea(walled, EAST)
    .slice(1)
    .filter(point => Math.abs(point.y - EAST.apex.y) < 0.5);

  expect(straightAhead.length).toBeGreaterThan(0);
  expect(straightAhead.every(point => point.x <= 9 + 1e-9)).toBe(true);
  expect(straightAhead.every(point => point.x > 8.99)).toBe(true);
});

it("follows the way the cone faces", () => {
  const north = visibleArea(open, {...EAST, aim: {x: 0, y: 1}}).slice(1);

  expect(Math.max(...north.map(point => point.y))).toBeCloseTo(EAST.apex.y + EAST.range, 6);
});

it("has the same number of points whatever it meets", () => {
  expect(visibleArea(walled, EAST)).toHaveLength(visibleArea(open, EAST).length);
});
