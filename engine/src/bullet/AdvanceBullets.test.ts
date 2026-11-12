import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {advanceBullets} from "@gunsmith/engine/bullet/AdvanceBullets";
import type {Bullet} from "@gunsmith/engine/bullet/types/Bullet";
import {BULLET_SPEED} from "@gunsmith/engine/bullet/flight/BulletSpeed";

// Floor is x 1 to 5 and y 1 to 3, with a one-tile pillar at x 3, y 2.
const hall = arenaFrom(["#######", "#.....#", "#..#..#", "#.....#", "#######"]);

function bulletAt(x: number, y: number, directionX: number, directionY: number): Bullet {
  return {position: {x, y}, direction: {x: directionX, y: directionY}};
}

it("moves a bullet along its direction at the bullet speed", () => {
  const [moved] = advanceBullets(hall, [bulletAt(1.5, 2.5, 1, 0)], 0.05);

  expect(moved?.position.x).toBeCloseTo(1.5 + BULLET_SPEED * 0.05, 9);
  expect(moved?.position.y).toBe(2.5);
});

it("keeps its direction as it goes", () => {
  const [moved] = advanceBullets(hall, [bulletAt(1.5, 1.5, 0, 1)], 0.01);

  expect(moved?.direction).toEqual({x: 0, y: 1});
});

it("moves every bullet it is given", () => {
  const moved = advanceBullets(hall, [bulletAt(1.5, 1.5, 1, 0), bulletAt(1.5, 3.5, 1, 0)], 0.01);

  expect(moved).toHaveLength(2);
  expect(moved[1]?.position.y).toBe(3.5);
});

it("drops a bullet that reaches the outer wall", () => {
  expect(advanceBullets(hall, [bulletAt(5.5, 1.5, 1, 0)], 0.1)).toEqual([]);
});

it("drops a bullet that hits a pillar in the middle of the floor", () => {
  expect(advanceBullets(hall, [bulletAt(1.5, 2.5, 1, 0)], 0.2)).toEqual([]);
});

it("does not let a bullet skip over a one-tile wall in a single step", () => {
  // 0.2 s at the bullet speed is far enough to jump the whole pillar from one side to the other.
  const across = advanceBullets(hall, [bulletAt(2.5, 2.5, 1, 0)], 0.2);

  expect(across).toEqual([]);
});

it("drops a bullet that starts inside a wall", () => {
  expect(advanceBullets(hall, [bulletAt(3.5, 2.5, 1, 0)], 0.001)).toEqual([]);
});

it("keeps the bullets that are still in open floor, and drops only the ones that hit", () => {
  const kept = advanceBullets(hall, [bulletAt(1.5, 1.5, 1, 0), bulletAt(5.5, 1.5, 1, 0)], 0.1);

  expect(kept).toHaveLength(1);
});

it("does not change the bullets it was given", () => {
  const bullets = [bulletAt(1.5, 1.5, 1, 0)];
  const before = structuredClone(bullets);

  advanceBullets(hall, bullets, 0.05);

  expect(bullets).toEqual(before);
});

it("drops a bullet that starts inside a wall even when its flight ends in open floor", () => {
  expect(advanceBullets(hall, [bulletAt(3.95, 2.5, 1, 0)], 0.1)).toEqual([]);
});
