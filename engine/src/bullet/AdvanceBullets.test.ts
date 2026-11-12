import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {advanceBullets} from "@gunsmith/engine/bullet/AdvanceBullets";
import type {Bullet} from "@gunsmith/engine/bullet/types/Bullet";
import type {Dummy} from "@gunsmith/engine/dummy/types/Dummy";

// Floor is x 1 to 5 and y 1 to 3, with a one-tile pillar at x 3, y 2.
const hall = arenaFrom(["#######", "#.....#", "#..#..#", "#.....#", "#######"]);

function dummyAt(x: number, y: number, health = 100): Dummy {
  return {position: {x, y}, health};
}

/** The bullets still in the air after flying `bullets` on, with no dummies about. */
function flown(bullets: readonly Bullet[], seconds: number): Bullet[] {
  return advanceBullets(hall, {bullets, dummies: [], seconds}).bullets;
}

const SPEED = 20;
const DAMAGE = 25;

function bulletAt(x: number, y: number, directionX: number, directionY: number, changes: Partial<Bullet> = {}): Bullet {
  return {position: {x, y}, direction: {x: directionX, y: directionY}, damage: DAMAGE, speed: SPEED, ...changes};
}

it("moves a bullet along its direction at the bullet speed", () => {
  const [moved] = flown([bulletAt(1.5, 2.5, 1, 0)], 0.05);

  expect(moved?.position.x).toBeCloseTo(1.5 + SPEED * 0.05, 9);
  expect(moved?.position.y).toBe(2.5);
});

it("moves each bullet at its own speed", () => {
  const [slow, fast] = flown([bulletAt(1.5, 1.5, 1, 0, {speed: 10}), bulletAt(1.5, 3.5, 1, 0, {speed: 30})], 0.05);

  expect(slow?.position.x).toBeCloseTo(1.5 + 10 * 0.05, 9);
  expect(fast?.position.x).toBeCloseTo(1.5 + 30 * 0.05, 9);
});

it("keeps its direction as it goes", () => {
  const [moved] = flown([bulletAt(1.5, 1.5, 0, 1)], 0.01);

  expect(moved?.direction).toEqual({x: 0, y: 1});
});

it("moves every bullet it is given", () => {
  const moved = flown([bulletAt(1.5, 1.5, 1, 0), bulletAt(1.5, 3.5, 1, 0)], 0.01);

  expect(moved).toHaveLength(2);
  expect(moved[1]?.position.y).toBe(3.5);
});

it("drops a bullet that reaches the outer wall", () => {
  expect(flown([bulletAt(5.5, 1.5, 1, 0)], 0.1)).toEqual([]);
});

it("drops a bullet that hits a pillar in the middle of the floor", () => {
  expect(flown([bulletAt(1.5, 2.5, 1, 0)], 0.2)).toEqual([]);
});

it("does not let a bullet skip over a one-tile wall in a single step", () => {
  // 0.2 s at the bullet speed is far enough to jump the whole pillar from one side to the other.
  const across = flown([bulletAt(2.5, 2.5, 1, 0)], 0.2);

  expect(across).toEqual([]);
});

it("drops a bullet that starts inside a wall", () => {
  expect(flown([bulletAt(3.5, 2.5, 1, 0)], 0.001)).toEqual([]);
});

it("keeps the damage and speed of a bullet as it goes", () => {
  const [moved] = flown([bulletAt(1.5, 1.5, 1, 0, {damage: 40, speed: 12})], 0.01);

  expect(moved?.damage).toBe(40);
  expect(moved?.speed).toBe(12);
});

it("keeps a slow bullet while a fast one beside it reaches the wall in the same step", () => {
  const kept = flown([bulletAt(4.5, 1.5, 1, 0, {speed: 2}), bulletAt(4.5, 3.5, 1, 0, {speed: 40})], 0.05);

  expect(kept).toHaveLength(1);
  expect(kept[0]?.position.y).toBe(1.5);
});

it("keeps the bullets that are still in open floor, and drops only the ones that hit", () => {
  const kept = flown([bulletAt(1.5, 1.5, 1, 0), bulletAt(5.5, 1.5, 1, 0)], 0.1);

  expect(kept).toHaveLength(1);
});

it("does not change the bullets it was given", () => {
  const bullets = [bulletAt(1.5, 1.5, 1, 0)];
  const before = structuredClone(bullets);

  advanceBullets(hall, {bullets, dummies: [], seconds: 0.05});

  expect(bullets).toEqual(before);
});

it("drops a bullet that starts inside a wall even when its flight ends in open floor", () => {
  expect(flown([bulletAt(3.95, 2.5, 1, 0)], 0.1)).toEqual([]);
});

// The dummies below have a radius of 0.4 (`DUMMY_RADIUS`); the row y 1.5 is clear floor from x 1 to 5.

function fly(
  bullets: readonly Bullet[],
  dummies: readonly Dummy[],
  seconds: number,
): ReturnType<typeof advanceBullets> {
  return advanceBullets(hall, {bullets, dummies, seconds});
}

it("hurts a dummy that a bullet reaches, and uses the bullet up", () => {
  const flight = fly([bulletAt(1.5, 1.5, 1, 0)], [dummyAt(3.5, 1.5)], 0.1);

  expect(flight.dummies).toEqual([dummyAt(3.5, 1.5, 100 - DAMAGE)]);
  expect(flight.bullets).toEqual([]);
});

it("leaves a dummy alone that the bullet does not reach this step, and keeps the bullet", () => {
  // One tile of flight (0.05 s) from x 1.5; the dummy's edge is 1.1 tiles away, so just out of reach.
  const flight = fly([bulletAt(1.5, 1.5, 1, 0)], [dummyAt(3, 1.5)], 0.05);

  expect(flight.dummies).toEqual([dummyAt(3, 1.5)]);
  expect(flight.bullets).toHaveLength(1);
});

it("hurts a dummy the bullet passes just inside the radius of, on either side", () => {
  expect(fly([bulletAt(1.5, 1.5, 1, 0)], [dummyAt(3.5, 1.89)], 0.1).dummies[0]?.health).toBe(100 - DAMAGE);
  expect(fly([bulletAt(1.5, 1.5, 1, 0)], [dummyAt(3.5, 1.11)], 0.1).dummies[0]?.health).toBe(100 - DAMAGE);
});

it("misses a dummy the bullet passes just outside the radius of, on either side", () => {
  expect(fly([bulletAt(1.5, 1.5, 1, 0)], [dummyAt(3.5, 1.91)], 0.1).dummies[0]?.health).toBe(100);
  expect(fly([bulletAt(1.5, 1.5, 1, 0)], [dummyAt(3.5, 1.09)], 0.1).dummies[0]?.health).toBe(100);
});

it("hurts a dummy that is only grazed, however thin the sliver of it the bullet crosses", () => {
  expect(fly([bulletAt(1.5, 1.5, 1, 0)], [dummyAt(3.5, 1.5 + 0.3999)], 0.1).dummies[0]?.health).toBe(100 - DAMAGE);
});

it("hurts a dummy standing in front of a wall when the bullet gets past both in one step", () => {
  // The pillar fills x 3 to 4 on row y 2. The dummy is just in front of it.
  const flight = fly([bulletAt(1.5, 2.5, 1, 0)], [dummyAt(2.5, 2.5)], 0.2);

  expect(flight.dummies[0]?.health).toBe(100 - DAMAGE);
  expect(flight.bullets).toEqual([]);
});

it("does not hurt a dummy standing behind a wall", () => {
  const flight = fly([bulletAt(1.5, 2.5, 1, 0)], [dummyAt(4.8, 2.5)], 0.2);

  expect(flight.dummies[0]?.health).toBe(100);
  expect(flight.bullets).toEqual([]);
});

it("hurts only the nearer of two dummies in a line, whichever comes first in the list", () => {
  const flight = fly([bulletAt(1.5, 1.5, 1, 0)], [dummyAt(4.5, 1.5), dummyAt(2.5, 1.5)], 0.2);

  expect(flight.dummies).toEqual([dummyAt(4.5, 1.5), dummyAt(2.5, 1.5, 100 - DAMAGE)]);
  expect(flight.bullets).toEqual([]);
});

it("takes the damage of the bullet that landed, whatever that is", () => {
  const flight = fly([bulletAt(1.5, 1.5, 1, 0, {damage: 60})], [dummyAt(3.5, 1.5)], 0.1);

  expect(flight.dummies[0]?.health).toBe(40);
});

it("adds up bullets of different damage that land on one dummy in the same step", () => {
  const flight = fly(
    [bulletAt(1.5, 1.5, 1, 0, {damage: 20}), bulletAt(1.5, 1.6, 1, 0, {damage: 50})],
    [dummyAt(3.5, 1.5)],
    0.1,
  );

  expect(flight.dummies[0]?.health).toBe(30);
});

it("reaches a dummy only as far as the bullet's own speed carries it", () => {
  // At 10 tiles a second, 0.1 s is one tile: the dummy's edge is 1.1 tiles away. At 30 it is three tiles.
  expect(fly([bulletAt(1.5, 1.5, 1, 0, {speed: 10})], [dummyAt(3, 1.5)], 0.1).dummies[0]?.health).toBe(100);
  expect(fly([bulletAt(1.5, 1.5, 1, 0, {speed: 30})], [dummyAt(3, 1.5)], 0.1).dummies[0]?.health).toBe(100 - DAMAGE);
});

it("counts every bullet that lands on a dummy in the same step", () => {
  const flight = fly([bulletAt(1.5, 1.5, 1, 0), bulletAt(1.5, 1.6, 1, 0)], [dummyAt(3.5, 1.5)], 0.1);

  expect(flight.dummies[0]?.health).toBe(100 - 2 * DAMAGE);
});

it("removes a dummy the bullet leaves with no health", () => {
  const flight = fly([bulletAt(1.5, 1.5, 1, 0)], [dummyAt(3.5, 1.5, DAMAGE), dummyAt(3.5, 3.5)], 0.1);

  expect(flight.dummies).toEqual([dummyAt(3.5, 3.5)]);
});

it("lets a wall stop a bullet that starts inside it, even where a dummy overlaps the wall", () => {
  // The pillar fills x 3 to 4 on row y 2; a dummy placed inside it is a mistake of the arena, and the wall still wins.
  const flight = fly([bulletAt(3.5, 2.5, 1, 0)], [dummyAt(3.5, 2.5)], 0.01);

  expect(flight.dummies[0]?.health).toBe(100);
  expect(flight.bullets).toEqual([]);
});

it("hurts a dummy that a bullet starts inside", () => {
  const flight = fly([bulletAt(2.6, 1.5, 1, 0)], [dummyAt(2.5, 1.5)], 0.001);

  expect(flight.dummies[0]?.health).toBe(100 - DAMAGE);
  expect(flight.bullets).toEqual([]);
});

it("does not change the dummies it was given", () => {
  const dummies = [dummyAt(3.5, 1.5)];
  const before = structuredClone(dummies);

  fly([bulletAt(1.5, 1.5, 1, 0)], dummies, 0.1);

  expect(dummies).toEqual(before);
});
