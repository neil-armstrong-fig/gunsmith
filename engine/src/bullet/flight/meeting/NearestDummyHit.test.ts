import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {nearestDummyHit} from "@gunsmith/engine/bullet/flight/meeting/NearestDummyHit";
import type {Bullet} from "@gunsmith/engine/bullet/types/Bullet";
import type {DummyHit} from "@gunsmith/engine/bullet/flight/types/DummyHit";
import type {Dummy} from "@gunsmith/engine/dummy/types/Dummy";

// Dummies have a radius of 0.4 (`DUMMY_RADIUS`). The bullet leaves the origin heading east.
const bullet: Bullet = {
  position: {x: 0, y: 0},
  direction: {x: 1, y: 0},
  damage: 25,
  speed: 20,
  shooter: "player",
  level: 0,
  crouching: false,
  floor: 0,
};

describe("in the open", () => {
  // No cover anywhere, so these cases judge the reach alone.
  const open = arenaFrom(["###", "#.#", "###"]);

  it("finds nothing when there are no dummies", () => {
    expect(nearest([], 10)).toBeUndefined();
  });

  it("finds the dummy the bullet reaches, and how far along it was touched", () => {
    const hit = nearest([dummyAt(3, 0)], 10);

    expect(hit?.dummyIndex).toBe(0);
    expect(hit?.distance).toBeCloseTo(2.6, 9);
  });

  it("counts a dummy whose edge is touched exactly at the end of the flight", () => {
    expect(nearest([dummyAt(2.9, 0)], 2.5)).toEqual({dummyIndex: 0, distance: 2.5});
  });

  it("ignores a dummy whose edge lies just past the end of the flight", () => {
    expect(nearest([dummyAt(2.95, 0)], 2.5)).toBeUndefined();
  });

  it("ignores a dummy that is far beyond the end of the flight", () => {
    expect(nearest([dummyAt(5, 0)], 2.5)).toBeUndefined();
  });

  it("ignores a dummy off to the side of the line of flight", () => {
    expect(nearest([dummyAt(2, 1)], 10)).toBeUndefined();
  });

  it("picks the nearest of several, whichever order they are listed in", () => {
    expect(nearest([dummyAt(6, 0), dummyAt(3, 0), dummyAt(9, 0)], 20)?.dummyIndex).toBe(1);
    expect(nearest([dummyAt(3, 0), dummyAt(6, 0)], 20)?.dummyIndex).toBe(0);
  });

  function nearest(dummies: readonly Dummy[], distance: number): DummyHit | undefined {
    return nearestDummyHit({arena: open, dummies, bullet, distance});
  }
});

describe("past a cover block", () => {
  // A cover block at x 3 on the row y 1, the bullet flying east along it from x 0.5.
  const covered = arenaFrom(["###########", "#..c......#", "###########"]);
  const alongTheRow: Bullet = {...bullet, position: {x: 0.5, y: 1.5}};

  it("passes over a crouched dummy with a cover block right beside it on the bullet's way", () => {
    const behindTheBlock = {position: {x: 4.5, y: 1.5}, health: 100, crouching: true};

    expect(nearestAlongTheRow([behindTheBlock])).toBeUndefined();
  });

  it("finds the dummy beyond one it passes over, by its place in the whole list", () => {
    const dummies = [
      {position: {x: 4.5, y: 1.5}, health: 100, crouching: true},
      {position: {x: 8.5, y: 1.5}, health: 100},
    ];

    expect(nearestAlongTheRow(dummies)?.dummyIndex).toBe(1);
  });

  it("hits a standing dummy behind cover, and a crouched one in the open", () => {
    const standing = {position: {x: 4.5, y: 1.5}, health: 100, crouching: false};
    const crouchedInTheOpen = {position: {x: 8.5, y: 1.5}, health: 100, crouching: true};

    expect(nearestAlongTheRow([standing])?.dummyIndex).toBe(0);
    expect(nearestAlongTheRow([crouchedInTheOpen])?.dummyIndex).toBe(0);
  });

  function nearestAlongTheRow(dummies: readonly Dummy[]): DummyHit | undefined {
    return nearestDummyHit({arena: covered, dummies, bullet: alongTheRow, distance: 10});
  }
});

function dummyAt(x: number, y: number): Dummy {
  return {position: {x, y}, health: 100};
}
