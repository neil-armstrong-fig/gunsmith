import {distanceToCircle} from "@gunsmith/engine/bullet/hit/DistanceToCircle";

const EAST = {x: 1, y: 0};
const circle = {centre: {x: 5, y: 5}, radius: 0.5};

it("is the gap to the near edge of a circle straight ahead", () => {
  expect(distanceToCircle({position: {x: 1, y: 5}, direction: EAST}, circle)).toBeCloseTo(3.5, 9);
});

it("is zero when the start is inside the circle", () => {
  expect(distanceToCircle({position: {x: 5.2, y: 5}, direction: EAST}, circle)).toBe(0);
});

it("is zero when the start is inside and facing away from the centre", () => {
  expect(distanceToCircle({position: {x: 5.2, y: 5}, direction: {x: -1, y: 0}}, circle)).toBe(0);
});

it("is zero when the start is exactly on the edge, even facing away", () => {
  expect(distanceToCircle({position: {x: 5.5, y: 5}, direction: EAST}, circle)).toBe(0);
});

it("counts a line that only just touches the circle as a hit", () => {
  expect(distanceToCircle({position: {x: 1, y: 5.5}, direction: EAST}, circle)).toBe(4);
});

it("hits a line that passes just inside the radius, on either side of the centre", () => {
  expect(distanceToCircle({position: {x: 1, y: 5.49}, direction: EAST}, circle)).toBeDefined();
  expect(distanceToCircle({position: {x: 1, y: 4.51}, direction: EAST}, circle)).toBeDefined();
});

it("misses a line that passes just outside the radius, on either side of the centre", () => {
  expect(distanceToCircle({position: {x: 1, y: 5.51}, direction: EAST}, circle)).toBeUndefined();
  expect(distanceToCircle({position: {x: 1, y: 4.49}, direction: EAST}, circle)).toBeUndefined();
});

it("misses a circle behind it", () => {
  expect(distanceToCircle({position: {x: 9, y: 5}, direction: EAST}, circle)).toBeUndefined();
});

it("enters a grazing circle at the first edge it meets, not at the middle", () => {
  // The line is 0.4 from the centre of a circle of radius 0.5, so the chord is 0.6 long.
  const distance = distanceToCircle({position: {x: 1, y: 5.4}, direction: EAST}, circle);

  expect(distance).toBeCloseTo(4 - Math.sqrt(0.5 ** 2 - 0.4 ** 2), 9);
});

it("works along any direction, not only east", () => {
  expect(distanceToCircle({position: {x: 5, y: 1}, direction: {x: 0, y: 1}}, circle)).toBeCloseTo(3.5, 9);
  expect(distanceToCircle({position: {x: 5, y: 9}, direction: {x: 0, y: -1}}, circle)).toBeCloseTo(3.5, 9);
});
