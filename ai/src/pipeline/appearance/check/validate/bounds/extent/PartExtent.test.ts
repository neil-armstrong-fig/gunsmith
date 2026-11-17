import type {Extent} from "@gunsmith/ai/pipeline/appearance/check/validate/bounds/extent/types/Extent";
import {partExtent} from "@gunsmith/ai/pipeline/appearance/check/validate/bounds/extent/PartExtent";
import type {AppearancePart} from "@gunsmith/shared/appearance/schema/part/AppearancePart";

const COMMON = {fill: "body", stroke: "edge", strokeWidth: 2, opacity: 1, rotation: 0, detail: "structural"} as const;

function expectExtent(actual: Extent, expected: Extent): void {
  expect(actual.minX).toBeCloseTo(expected.minX, 6);
  expect(actual.minY).toBeCloseTo(expected.minY, 6);
  expect(actual.maxX).toBeCloseTo(expected.maxX, 6);
  expect(actual.maxY).toBeCloseTo(expected.maxY, 6);
}

it("grows a circle by half its stroke on every side", () => {
  const part: AppearancePart = {...COMMON, kind: "circle", x: 32, y: 32, radius: 6};

  expectExtent(partExtent(part), {minX: 25, minY: 25, maxX: 39, maxY: 39});
});

it("adds nothing for a stroke that is not drawn: the role is none", () => {
  const part: AppearancePart = {...COMMON, kind: "circle", x: 32, y: 32, radius: 6, stroke: "none", strokeWidth: 4};

  expectExtent(partExtent(part), {minX: 26, minY: 26, maxX: 38, maxY: 38});
});

it("adds nothing for a stroke that is not drawn: the width is zero", () => {
  const part: AppearancePart = {...COMMON, kind: "circle", x: 32, y: 32, radius: 6, strokeWidth: 0};

  expectExtent(partExtent(part), {minX: 26, minY: 26, maxX: 38, maxY: 38});
});

it("measures an ellipse by its two radii", () => {
  const part: AppearancePart = {...COMMON, kind: "ellipse", x: 32, y: 32, radiusX: 10, radiusY: 4};

  expectExtent(partExtent(part), {minX: 21, minY: 27, maxX: 43, maxY: 37});
});

it("measures a rectangle from its upper-left corner", () => {
  const part: AppearancePart = {...COMMON, kind: "rect", x: 10, y: 20, width: 30, height: 8};

  expectExtent(partExtent(part), {minX: 9, minY: 19, maxX: 41, maxY: 29});
});

it("measures a polygon by its outermost points", () => {
  const part: AppearancePart = {
    ...COMMON,
    kind: "polygon",
    x: 0,
    y: 0,
    points: [
      [10, 10],
      [30, 12],
      [20, 40],
    ],
  };

  expectExtent(partExtent(part), {minX: 9, minY: 9, maxX: 31, maxY: 41});
});

it("measures a polyline the same way, its points being local to the part's x and y", () => {
  const part: AppearancePart = {
    ...COMMON,
    kind: "polyline",
    x: 5,
    y: 7,
    points: [
      [0, 0],
      [10, 4],
    ],
    fill: "none",
  };

  expectExtent(partExtent(part), {minX: 4, minY: 6, maxX: 16, maxY: 12});
});

it("turns a rectangle about its x and y, not its middle", () => {
  const part: AppearancePart = {
    ...COMMON,
    kind: "rect",
    x: 30,
    y: 40,
    width: 30,
    height: 4,
    stroke: "none",
    rotation: 90,
  };

  expectExtent(partExtent(part), {minX: 26, minY: 40, maxX: 30, maxY: 70});
});

it("turns a rectangle half a turn to the other side of its x and y", () => {
  const part: AppearancePart = {
    ...COMMON,
    kind: "rect",
    x: 30,
    y: 30,
    width: 10,
    height: 4,
    stroke: "none",
    rotation: 180,
  };

  expectExtent(partExtent(part), {minX: 20, minY: 26, maxX: 30, maxY: 30});
});

it("swaps an ellipse's radii when it is turned a quarter, about its own middle", () => {
  const part: AppearancePart = {
    ...COMMON,
    kind: "ellipse",
    x: 32,
    y: 32,
    radiusX: 10,
    radiusY: 4,
    stroke: "none",
    rotation: 90,
  };

  expectExtent(partExtent(part), {minX: 28, minY: 22, maxX: 36, maxY: 42});
});

it("leaves a circle where it is however it is turned", () => {
  const part: AppearancePart = {...COMMON, kind: "circle", x: 32, y: 32, radius: 6, stroke: "none", rotation: 45};

  expectExtent(partExtent(part), {minX: 26, minY: 26, maxX: 38, maxY: 38});
});
