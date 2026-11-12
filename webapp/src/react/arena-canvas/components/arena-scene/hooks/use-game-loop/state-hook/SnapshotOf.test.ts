import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import {snapshotOf} from "@src/react/arena-canvas/components/arena-scene/hooks/use-game-loop/state-hook/SnapshotOf";

const world = startingWorld(arenaFrom(["#####", "#...#", "#...#", "#...#", "#####"]));

it("reports the arena's size in tiles", () => {
  expect(snapshotOf(world).arena).toEqual({width: 5, height: 5});
});

it("reports where the player's centre is", () => {
  expect(snapshotOf(world).player).toMatchObject({x: 2.5, y: 2.5});
});

it("reports the game clock", () => {
  expect(snapshotOf({...world, elapsedSeconds: 3.5}).elapsedSeconds).toBe(3.5);
});

it("hands back a copy, so reading it cannot change the game", () => {
  const snapshot = snapshotOf(world);
  snapshot.player.x = 99;

  expect(world.player.position.x).toBe(2.5);
});

it("reports the way the player faces in degrees, 0 being east and 90 north", () => {
  const facing = (x: number, y: number): number =>
    snapshotOf({...world, player: {...world.player, aim: {x, y}}}).player.aimDegrees;

  expect(facing(1, 0)).toBe(0);
  expect(facing(0, 1)).toBe(90);
  expect(facing(0, -1)).toBe(-90);
  expect(facing(-Math.SQRT1_2, Math.SQRT1_2)).toBeCloseTo(135, 9);
});

it("reports no bullets when none are in the air", () => {
  expect(snapshotOf(world).bullets).toEqual([]);
});

it("reports where each bullet in the air is", () => {
  const flying = {...world, bullets: [{position: {x: 1, y: 2}, direction: {x: 1, y: 0}}]};

  expect(snapshotOf(flying).bullets).toEqual([{x: 1, y: 2}]);
});
