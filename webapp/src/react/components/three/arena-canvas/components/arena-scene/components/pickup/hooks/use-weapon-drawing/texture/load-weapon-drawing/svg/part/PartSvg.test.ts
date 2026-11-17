import type {AppearancePart} from "@gunsmith/shared/appearance/schema/part/AppearancePart";
import {partSvg} from "@src/react/components/three/arena-canvas/components/arena-scene/components/pickup/hooks/use-weapon-drawing/texture/load-weapon-drawing/svg/part/PartSvg";

const PALETTE = {accent: "weapon-blue", "accent-secondary": "weapon-violet"} as const;

const PAINT = {
  fill: "accent",
  stroke: "edge",
  strokeWidth: 2,
  opacity: 0.5,
  rotation: 30,
  detail: "structural",
} as const;

it("draws a circle at its centre, turned about it, in the colours its roles name", () => {
  const part: AppearancePart = {kind: "circle", x: 10, y: 20, radius: 5, ...PAINT};

  expect(partSvg(part, PALETTE)).toBe(
    '<circle transform="translate(10 20) rotate(30)" r="5" fill="#62B5FF" stroke="#91A2B2" stroke-width="2" opacity="0.5" stroke-linejoin="round" stroke-linecap="round"/>',
  );
});

it("draws an ellipse with both radii", () => {
  const part: AppearancePart = {kind: "ellipse", x: 1, y: 2, radiusX: 7, radiusY: 3, ...PAINT};

  expect(partSvg(part, PALETTE)).toContain('<ellipse transform="translate(1 2) rotate(30)" rx="7" ry="3"');
});

it("draws a rectangle from its upper-left corner with its width and height", () => {
  const part: AppearancePart = {kind: "rect", x: 4, y: 6, width: 18, height: 8, ...PAINT};

  expect(partSvg(part, PALETTE)).toContain('<rect transform="translate(4 6) rotate(30)" width="18" height="8"');
});

it("draws a polygon and a polyline from their points, local to the part's place", () => {
  const points: [number, number][] = [
    [0, 0],
    [10, 0],
    [10, 5],
  ];

  expect(partSvg({kind: "polygon", x: 2, y: 3, points, ...PAINT}, PALETTE)).toContain(
    '<polygon transform="translate(2 3) rotate(30)" points="0,0 10,0 10,5"',
  );
  expect(partSvg({kind: "polyline", x: 2, y: 3, points, ...PAINT}, PALETTE)).toContain(
    '<polyline transform="translate(2 3) rotate(30)" points="0,0 10,0 10,5"',
  );
});

it("draws nothing for a role of none, so a line is open and a ghost has no outline", () => {
  const part: AppearancePart = {kind: "circle", x: 0, y: 0, radius: 1, ...PAINT, fill: "none", stroke: "none"};

  expect(partSvg(part, PALETTE)).toContain('fill="none" stroke="none"');
});
