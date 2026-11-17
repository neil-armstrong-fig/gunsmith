import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import type {BufferGeometry} from "three";
import {dimmedGeometry} from "@src/react/components/three/arena-canvas/components/arena-scene/components/vision-overlay/geometry/DimmedGeometry";

// An arena 10 tiles wide and 6 high.
const arena = arenaFrom(["##########", "#........#", "#........#", "#........#", "#........#", "##########"]);

it("covers the whole arena but the visible outline", () => {
  const square = [
    {x: 2, y: 2},
    {x: 4, y: 2},
    {x: 4, y: 4},
    {x: 2, y: 4},
  ];

  expect(areaOf(dimmedGeometry(arena, square))).toBeCloseTo(10 * 6 - 4, 9);
});

it("covers the whole arena when nothing is visible", () => {
  expect(areaOf(dimmedGeometry(arena, []))).toBeCloseTo(10 * 6, 9);
});

it("does not mind which way round the outline runs", () => {
  const clockwise = [
    {x: 2, y: 2},
    {x: 2, y: 4},
    {x: 4, y: 4},
    {x: 4, y: 2},
  ];

  expect(areaOf(dimmedGeometry(arena, clockwise))).toBeCloseTo(10 * 6 - 4, 9);
});

/** The total area of the triangles the geometry draws. */
function areaOf(geometry: BufferGeometry): number {
  const positions = geometry.getAttribute("position");
  const index = geometry.getIndex();
  if (!index) {
    throw new Error("The geometry has no index.");
  }

  let area = 0;
  for (let corner = 0; corner < index.count; corner += 3) {
    const [a, b, c] = [index.getX(corner), index.getX(corner + 1), index.getX(corner + 2)];
    const [ax, ay] = [positions.getX(a), positions.getY(a)];
    const [bx, by] = [positions.getX(b), positions.getY(b)];
    const [cx, cy] = [positions.getX(c), positions.getY(c)];
    area += Math.abs((bx - ax) * (cy - ay) - (cx - ax) * (by - ay)) / 2;
  }

  return area;
}
