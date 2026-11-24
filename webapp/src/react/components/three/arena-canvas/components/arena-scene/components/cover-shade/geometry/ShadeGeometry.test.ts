import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {shadeGeometry} from "@src/react/components/three/arena-canvas/components/arena-scene/components/cover-shade/geometry/ShadeGeometry";

it("is empty when there are no places to shade", () => {
  expect(shadeGeometry([]).getAttribute("position").count).toBe(0);
});

it("makes two triangles, six corners, for each place", () => {
  const geometry = shadeGeometry([
    {x: 1, y: 1, size: 0.25},
    {x: 2, y: 3, size: 0.25},
  ]);

  expect(geometry.getAttribute("position").count).toBe(12);
});

it("covers each place's square exactly, and no more", () => {
  const geometry = shadeGeometry([{x: 4.25, y: 1.5, size: 0.25}]);
  const corners = cornersOf(geometry.getAttribute("position").array);

  expect(Math.min(...corners.map(corner => corner.x))).toBeCloseTo(4.25, 9);
  expect(Math.max(...corners.map(corner => corner.x))).toBeCloseTo(4.5, 9);
  expect(Math.min(...corners.map(corner => corner.y))).toBeCloseTo(1.5, 9);
  expect(Math.max(...corners.map(corner => corner.y))).toBeCloseTo(1.75, 9);
  expect(areaOf(corners)).toBeCloseTo(0.25 * 0.25, 9);
});

function cornersOf(positions: ArrayLike<number>): Point[] {
  return Array.from({length: positions.length / 3}, (_, index) => ({
    x: positions[index * 3] ?? NaN,
    y: positions[index * 3 + 1] ?? NaN,
  }));
}

function areaOf(corners: readonly Point[]): number {
  let area = 0;
  for (let triangle = 0; triangle < corners.length; triangle += 3) {
    const [first, second, third] = [corners[triangle], corners[triangle + 1], corners[triangle + 2]];
    if (first && second && third) {
      area += Math.abs((second.x - first.x) * (third.y - first.y) - (third.x - first.x) * (second.y - first.y)) / 2;
    }
  }

  return area;
}
