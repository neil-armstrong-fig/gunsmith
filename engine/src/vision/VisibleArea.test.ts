import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import {RIDGELINE_BUILT_IN_ARENA} from "@gunsmith/engine/built-in-arenas/drawings/RidgelineBuiltInArena";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import type {Polygon} from "@gunsmith/engine/geometry/types/Polygon";
import {isInCone} from "@gunsmith/engine/vision/cone/IsInCone";
import {hasClearSight} from "@gunsmith/engine/vision/sight/HasClearSight";
import {visibleArea} from "@gunsmith/engine/vision/VisibleArea";
import type {Cone} from "@gunsmith/engine/vision/types/Cone";
import type {VisibleArea} from "@gunsmith/engine/vision/types/VisibleArea";

const open = room();
// A wall across the room whose face is at x = 9, three and a half tiles east of the apex.
const walled = room(9);

const EAST: Cone = {
  apex: {x: 5.5, y: 15.5},
  aim: {x: 1, y: 0},
  halfAngleRadians: Math.PI / 4,
  range: 10,
  eyeLevel: 0,
  crouching: false,
};

describe("on the flat", () => {
  it("starts at the apex", () => {
    expect(visibleArea(open, EAST).outline[0]).toEqual(EAST.apex);
  });

  it("reaches the full range straight ahead when nothing is in the way", () => {
    const reach = visibleArea(open, EAST)
      .outline.slice(1)
      .map(point => Math.hypot(point.x - EAST.apex.x, point.y - EAST.apex.y));

    expect(Math.max(...reach)).toBeCloseTo(EAST.range, 6);
  });

  it("stays inside the cone", () => {
    expect(visibleArea(open, EAST).outline.every(point => isInCone({...EAST, range: EAST.range + 1e-6}, point))).toBe(
      true,
    );
  });

  it("covers the whole width of the cone", () => {
    const edges = visibleArea(open, EAST).outline.slice(1);
    const first = edges[0];
    const last = edges[edges.length - 1];

    expect(first?.y).toBeCloseTo(EAST.apex.y - Math.sin(Math.PI / 4) * EAST.range, 6);
    expect(last?.y).toBeCloseTo(EAST.apex.y + Math.sin(Math.PI / 4) * EAST.range, 6);
  });

  it("stops exactly at the face of a wall instead of reaching through it", () => {
    const straightAhead = visibleArea(walled, EAST)
      .outline.slice(1)
      .filter(point => Math.abs(point.y - EAST.apex.y) < 0.5);

    expect(straightAhead.length).toBeGreaterThan(0);
    expect(straightAhead.every(point => point.x <= 9 + 1e-9)).toBe(true);
    expect(straightAhead.every(point => point.x > 8.99)).toBe(true);
  });

  it("follows the way the cone faces", () => {
    const north = visibleArea(open, {...EAST, aim: {x: 0, y: 1}}).outline.slice(1);

    expect(Math.max(...north.map(point => point.y))).toBeCloseTo(EAST.apex.y + EAST.range, 6);
  });

  it("has the same number of points whatever it meets", () => {
    expect(visibleArea(walled, EAST).outline).toHaveLength(visibleArea(open, EAST).outline.length);
  });
});

describe("across levels", () => {
  // The floor from x = 9 eastward is a level up, so its face is at x = 9, three and a half tiles east of the apex.
  const platformAhead = roomSplitAt(9, ".", "1");
  const lowGroundAhead = roomSplitAt(9, "1", ".");

  it("reaches one tile onto a platform when looking up at it from lower ground, as far as the edge rule shows", () => {
    const straightAhead = visibleArea(platformAhead, EAST)
      .outline.slice(1)
      .filter(point => Math.abs(point.y - EAST.apex.y) < 0.5);

    expect(straightAhead.length).toBeGreaterThan(0);
    expect(straightAhead.every(point => point.x <= 10 + 1e-9)).toBe(true);
    expect(straightAhead.every(point => point.x > 9.99)).toBe(true);
  });

  it("reaches across a platform from a viewer who stands as high as it", () => {
    const reach = visibleArea(platformAhead, {...EAST, eyeLevel: 1})
      .outline.slice(1)
      .map(point => Math.hypot(point.x - EAST.apex.x, point.y - EAST.apex.y));

    expect(Math.max(...reach)).toBeCloseTo(EAST.range, 6);
  });

  it("reaches across low ground from a viewer at a platform's edge, where a drop is no wall", () => {
    const atTheEdge = {...EAST, apex: {x: 8.5, y: 15.5}, eyeLevel: 1};
    const reach = visibleArea(lowGroundAhead, atTheEdge)
      .outline.slice(1)
      .map(point => Math.hypot(point.x - atTheEdge.apex.x, point.y - atTheEdge.apex.y));

    expect(Math.max(...reach)).toBeCloseTo(EAST.range, 6);
  });

  it("stops at a platform's edge for a viewer back from it, who cannot see down past it", () => {
    const straightAhead = visibleArea(lowGroundAhead, {...EAST, eyeLevel: 1})
      .outline.slice(1)
      .filter(point => Math.abs(point.y - EAST.apex.y) < 0.5);

    expect(straightAhead.length).toBeGreaterThan(0);
    expect(straightAhead.every(point => point.x <= 9 + 1e-9)).toBe(true);
    expect(straightAhead.every(point => point.x > 8.99)).toBe(true);
  });

  it("stops each ray where the sight rule stops, seen just before and not just after", () => {
    for (const point of visibleArea(platformAhead, EAST).outline.slice(1)) {
      const length = Math.hypot(point.x - EAST.apex.x, point.y - EAST.apex.y);
      if (length >= EAST.range - 1e-6) {
        continue;
      }

      const along = (distance: number): Point => ({
        x: EAST.apex.x + ((point.x - EAST.apex.x) / length) * distance,
        y: EAST.apex.y + ((point.y - EAST.apex.y) / length) * distance,
      });

      expect(hasClearSight(platformAhead, {from: EAST.apex, eye: EAST, to: along(length - 0.01)})).toBe(true);
      expect(hasClearSight(platformAhead, {from: EAST.apex, eye: EAST, to: along(length + 0.01)})).toBe(false);
    }
  });
});

describe("past a row of cover blocks", () => {
  // A row of cover blocks across the room, their face at x = 9.
  const coverAcross = roomWithCoverAt(9);

  it("reaches over a row of cover blocks from a standing viewer", () => {
    const reach = visibleArea(coverAcross, EAST)
      .outline.slice(1)
      .map(point => Math.hypot(point.x - EAST.apex.x, point.y - EAST.apex.y));

    expect(Math.max(...reach)).toBeCloseTo(EAST.range, 6);
  });

  it("stops at the face of a row of cover blocks for a crouching viewer", () => {
    const straightAhead = visibleArea(coverAcross, {...EAST, crouching: true})
      .outline.slice(1)
      .filter(point => Math.abs(point.y - EAST.apex.y) < 0.5);

    expect(straightAhead.length).toBeGreaterThan(0);
    expect(straightAhead.every(point => point.x <= 9 + 1e-9)).toBe(true);
    expect(straightAhead.every(point => point.x > 8.99)).toBe(true);
  });

  it("reaches over a row of cover blocks on lower ground from a crouching viewer on a platform", () => {
    const reach = visibleArea(coverAcross, {...EAST, crouching: true, eyeLevel: 1})
      .outline.slice(1)
      .map(point => Math.hypot(point.x - EAST.apex.x, point.y - EAST.apex.y));

    expect(Math.max(...reach)).toBeCloseTo(EAST.range, 6);
  });
});

describe("across the low ground to the other ridge on Ridgeline", () => {
  // Ridgeline's south ridge, one level up, fills x 6 to 26 and y 2 to 4; its north ridge fills the same columns and y 10 to 12, with
  // low ground and a few cover blocks between. The viewer stands deep on the south ridge, at its back, facing north across both.
  const ridgeline = arenaFrom(RIDGELINE_BUILT_IN_ARENA.rows);
  const DEEP_ON_THE_SOUTH_RIDGE: Cone = {
    apex: {x: 16.5, y: 2.5},
    aim: {x: 0, y: 1},
    halfAngleRadians: Math.PI / 4,
    range: 12,
    eyeLevel: 1,
    crouching: false,
  };
  // Near the ridge's east end, where the cone's east side looks past the end of the north ridge.
  const NEAR_THE_EAST_END: Cone = {...DEEP_ON_THE_SOUTH_RIDGE, apex: {x: 22.5, y: 2.5}};
  const NORTH_RIDGE = {x: 16.5, y: 11.5};
  const LOW_GROUND_BETWEEN = {x: 16.5, y: 6.5};

  it("sees the north ridge from deep on the south one, and not the low ground between, by the sight rule", () => {
    const eye = DEEP_ON_THE_SOUTH_RIDGE;

    expect(hasClearSight(ridgeline, {from: eye.apex, eye, to: NORTH_RIDGE})).toBe(true);
    expect(hasClearSight(ridgeline, {from: eye.apex, eye, to: LOW_GROUND_BETWEEN})).toBe(false);
  });

  it("shows the north ridge in detail and hides the low ground between", () => {
    const area = visibleArea(ridgeline, DEEP_ON_THE_SOUTH_RIDGE);

    expect(isShown(area, NORTH_RIDGE)).toBe(true);
    expect(isShown(area, LOW_GROUND_BETWEEN)).toBe(false);
  });

  it.each([
    ["deep in the middle of the south ridge", DEEP_ON_THE_SOUTH_RIDGE],
    ["near the south ridge's east end", NEAR_THE_EAST_END],
  ])(
    "shows a point if and only if the sight rule sees it, from %s, but for a sliver at the ends of the north ridge",
    (_, cone) => {
      const area = visibleArea(ridgeline, cone);
      const inside = placesInside(cone);
      const disagreeing = inside.filter(point => {
        return isShown(area, point) !== hasClearSight(ridgeline, {from: cone.apex, eye: cone, to: point});
      });

      expect(inside.length).toBeGreaterThan(500);
      expect(disagreeing.length / inside.length).toBeLessThan(0.01);
    },
  );

  it.each([
    ["deep in the middle of the south ridge", DEEP_ON_THE_SOUTH_RIDGE],
    ["near the south ridge's east end", NEAR_THE_EAST_END],
  ])(
    "keeps every hidden patch inside the outline and apart from the others, from %s, so no ground is dimmed twice",
    (_, cone) => {
      const area = visibleArea(ridgeline, cone);
      const places = placesInside({...cone, halfAngleRadians: Math.PI / 2, range: 14});

      expect(area.hidden.length).toBeGreaterThan(0);
      for (const point of places) {
        const patches = area.hidden.filter(patch => isInside(patch, point)).length;

        expect(patches).toBeLessThanOrEqual(1);
        expect(patches === 0 || isInside(area.outline, point)).toBe(true);
      }
    },
  );
});

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

// The same room with a cover block in every row at `column`.
function roomWithCoverAt(column: number): Arena {
  const rows = Array.from({length: 31}, (_, y) => {
    if (y === 0 || y === 30) {
      return "#".repeat(31);
    }

    return Array.from({length: 31}, (_, x) => {
      if (x === 0 || x === 30) {
        return "#";
      }

      if (x === column) {
        return "c";
      }

      return ".";
    }).join("");
  });

  return arenaFrom(rows);
}

// The same room with `west` as the floor west of `column` and `east` as the floor from there eastward: a drop, whichever way it faces.
function roomSplitAt(column: number, west: string, east: string): Arena {
  const rows = Array.from({length: 31}, (_, y) => {
    if (y === 0 || y === 30) {
      return "#".repeat(31);
    }

    return Array.from({length: 31}, (_, x) => {
      if (x === 0 || x === 30) {
        return "#";
      }

      if (x >= column) {
        return east;
      }

      return west;
    }).join("");
  });

  return arenaFrom(rows);
}

// Whether `area` shows `point` in detail: inside the outline and in no hidden patch.
function isShown(area: VisibleArea, point: Point): boolean {
  return isInside(area.outline, point) && !area.hidden.some(patch => isInside(patch, point));
}

// Whether `point` is inside `polygon`, by counting the edges a line from it to the east crosses.
function isInside(polygon: Polygon, point: Point): boolean {
  let inside = false;
  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index, index += 1) {
    const a = polygon[index];
    const b = polygon[previous];
    if (a && b && a.y > point.y !== b.y > point.y && point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x) {
      inside = !inside;
    }
  }

  return inside;
}

// Places a quarter of a tile apart inside `cone`, kept a tenth of a tile in from its edges, and set off the grid by uneven amounts, so
// none lies exactly on a tile's face or on a ray, where inside and outside are a matter of rounding.
function placesInside(cone: Cone): Point[] {
  const places: Point[] = [];
  for (let x = cone.apex.x - cone.range + 0.13; x <= cone.apex.x + cone.range; x += 0.25) {
    for (let y = cone.apex.y - cone.range + 0.07; y <= cone.apex.y + cone.range; y += 0.25) {
      const point = {x, y};
      if (isInCone({...cone, range: cone.range - 0.1, halfAngleRadians: cone.halfAngleRadians - 0.01}, point)) {
        places.push(point);
      }
    }
  }

  return places;
}
