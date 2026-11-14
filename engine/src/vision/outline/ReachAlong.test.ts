import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {reachAlong} from "@gunsmith/engine/vision/outline/ReachAlong";

// Floor is x 1 to 8 and y 1 to 3; a wall tile stands at x 5, y 2, so its west face is at x 5.
const room = arenaFrom(["##########", "#........#", "#....#...#", "#........#", "##########"]);
const EAST = {x: 1, y: 0};

it("reaches the full range when nothing is in the way", () => {
  expect(reachAlong(room, {position: {x: 1.5, y: 1.5}, direction: EAST}, 4)).toBe(4);
});

it("stops at the face of a wall, not a sample inside it", () => {
  const reach = reachAlong(room, {position: {x: 1.5, y: 2.5}, direction: EAST}, 10);

  expect(reach).toBeLessThanOrEqual(3.5);
  expect(reach).toBeGreaterThan(3.5 - 0.001);
});

it("stops at the face of a wall met at a slant", () => {
  const angle = Math.PI / 12;
  const reach = reachAlong(room, {position: {x: 1.5, y: 1.5}, direction: {x: Math.cos(angle), y: Math.sin(angle)}}, 10);

  expect(reach).toBeLessThanOrEqual(3.5 / Math.cos(angle));
  expect(reach).toBeGreaterThan(3.5 / Math.cos(angle) - 0.001);
});

it("stops at the outer wall when the range goes past it", () => {
  const reach = reachAlong(room, {position: {x: 1.5, y: 1.5}, direction: EAST}, 20);

  expect(reach).toBeLessThanOrEqual(7.5);
  expect(reach).toBeGreaterThan(7.5 - 0.001);
});

it("does not reach at all from inside a wall", () => {
  expect(reachAlong(room, {position: {x: 5.5, y: 2.5}, direction: EAST}, 10)).toBe(0);
});
