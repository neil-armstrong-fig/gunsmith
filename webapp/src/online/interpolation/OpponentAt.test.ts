import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import type {Player} from "@gunsmith/engine/player/types/Player";
import {opponentAt} from "@src/online/interpolation/OpponentAt";
import type {SnapshotOfOpponent} from "@src/online/interpolation/types/SnapshotOfOpponent";

const FIGHTER: Player = startingWorld(arenaFrom(["#####", "#...#", "#####"]), [], {x: 2.5, y: 1.5}).player;

it("has nobody to draw before any snapshot", () => {
  expect(opponentAt([], 1)).toBeUndefined();
});

it("blends the fighter between the two snapshots either side of the time", () => {
  const snapshots = [told(1, standingAt(2)), told(2, standingAt(4))];

  expect(opponentAt(snapshots, 1.25)?.position).toEqual({x: 2.5, y: 1.5});
  expect(opponentAt(snapshots, 1.75)?.position.x).toBeCloseTo(3.5);
});

it("turns the aim the short way round between two snapshots", () => {
  const snapshots = [told(1, {...standingAt(2), aim: {x: 1, y: 0}}), told(2, {...standingAt(2), aim: {x: 0, y: 1}})];
  const halfway = opponentAt(snapshots, 1.5)?.aim;

  expect(halfway?.x).toBeCloseTo(Math.SQRT1_2);
  expect(halfway?.y).toBeCloseTo(Math.SQRT1_2);
});

it("holds the fighter where they were last seen until the snapshot that no longer has them, never moving them on", () => {
  const snapshots = [told(1, standingAt(2)), told(2, undefined)];

  expect(opponentAt(snapshots, 1.9)?.position.x).toBe(2);
});

it("draws nobody from the time of the first snapshot that does not hold them", () => {
  const snapshots = [told(1, standingAt(2)), told(2, undefined)];

  expect(opponentAt(snapshots, 2)).toBeUndefined();
  expect(opponentAt(snapshots, 2.5)).toBeUndefined();
});

it("does not draw a fighter before the snapshot that first holds them", () => {
  const snapshots = [told(1, undefined), told(2, standingAt(4))];

  expect(opponentAt(snapshots, 1.9)).toBeUndefined();
  expect(opponentAt(snapshots, 2)?.position.x).toBe(4);
});

it("holds the newest snapshot's fighter when the time runs past it, and does not guess where they went", () => {
  const snapshots = [told(1, standingAt(2)), told(2, standingAt(4))];

  expect(opponentAt(snapshots, 5)?.position.x).toBe(4);
});

it("holds the oldest snapshot's fighter when the time is before it", () => {
  expect(opponentAt([told(2, standingAt(4)), told(3, standingAt(5))], 1)?.position.x).toBe(4);
});

function standingAt(x: number, y = 1.5): Player {
  return {...FIGHTER, position: {x, y}};
}

function told(elapsedSeconds: number, opponent: Player | undefined): SnapshotOfOpponent {
  return {elapsedSeconds, opponent};
}
