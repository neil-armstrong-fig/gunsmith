import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import {opponentInput} from "@gunsmith/engine/opponent/OpponentInput";
import {BURST_SECONDS} from "@gunsmith/engine/opponent/burst/BurstSeconds";

// The player stands at (5.5, 3.5), the middle; the opponent at (8.5, 3.5), three tiles east on the same row.
const clear = arenaFrom([
  "###########",
  "#.........#",
  "#.........#",
  "#.........#",
  "#.........#",
  "#.........#",
  "###########",
]);

function duel(): World {
  return startingWorld(clear, [], {x: 8.5, y: 3.5});
}

function withPillarBetween(): World {
  const walled = arenaFrom([
    "###########",
    "#.........#",
    "#.........#",
    "#....#....#",
    "#....#....#",
    "#.........#",
    "###########",
  ]);

  return {...duel(), arena: walled, player: {...duel().player, position: {x: 3.5, y: 3.5}}};
}

function atTime(world: World, elapsedSeconds: number): World {
  return {...world, elapsedSeconds};
}

it("asks for nothing when there is no opponent", () => {
  const input = opponentInput(startingWorld(clear));

  expect(input.firing).toBe(false);
  expect(input.reload).toBe(false);
  expect(input.direction).toEqual({x: 0, y: 0});
  expect(input.aimAt).toBeUndefined();
});

it("aims at the player", () => {
  const world = duel();

  expect(opponentInput(world).aimAt).toEqual(world.player.position);
});

it("stands still", () => {
  expect(opponentInput(duel()).direction).toEqual({x: 0, y: 0});
});

it("fires during a burst when it can see the player", () => {
  expect(opponentInput(atTime(duel(), 0)).firing).toBe(true);
});

it("holds its fire between bursts", () => {
  expect(opponentInput(atTime(duel(), BURST_SECONDS + 0.1)).firing).toBe(false);
});

it("holds its fire during a burst when a wall is between it and the player", () => {
  expect(opponentInput(atTime(withPillarBetween(), 0)).firing).toBe(false);
});

it("still aims at the player when a wall is between them", () => {
  const world = withPillarBetween();

  expect(opponentInput(world).aimAt).toEqual(world.player.position);
});

it("does not reload while it still has rounds", () => {
  expect(opponentInput(atTime(duel(), BURST_SECONDS + 0.1)).reload).toBe(false);
});

it("reloads when its magazine is empty", () => {
  const world = duel();
  const opponent = world.opponent;
  if (!opponent) {
    throw new Error("The duel has no opponent.");
  }

  const loadout = opponent.loadout.map((carried, index) => (index === 0 ? {...carried, rounds: 0} : carried));
  const empty = {...world, opponent: {...opponent, loadout}};

  expect(opponentInput(empty).reload).toBe(true);
});
