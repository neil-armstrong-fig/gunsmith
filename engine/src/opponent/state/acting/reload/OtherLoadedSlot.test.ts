import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {otherLoadedSlot} from "@gunsmith/engine/opponent/state/acting/reload/OtherLoadedSlot";
import type {Player} from "@gunsmith/engine/player/types/Player";

const world = startingWorld(arenaFrom(["#####", "#...#", "#####"]), [], {x: 2.5, y: 1.5});

it("names the slot, counting from 1, of the other weapon when it has rounds in its magazine", () => {
  expect(otherLoadedSlot(opponentWith([0, 3], [0, 0], 0))).toBe(2);
  expect(otherLoadedSlot(opponentWith([3, 0], [0, 0], 1))).toBe(1);
});

it("names it when the other weapon has only a reserve", () => {
  expect(otherLoadedSlot(opponentWith([0, 0], [0, 4], 0))).toBe(2);
});

it("names none when the other weapon is dry too", () => {
  expect(otherLoadedSlot(opponentWith([0, 0], [0, 0], 0))).toBeUndefined();
});

it("never names the weapon already in hand", () => {
  expect(otherLoadedSlot(opponentWith([5, 0], [5, 0], 0))).toBeUndefined();
});

function opponentWith(
  rounds: readonly [number, number],
  reserves: readonly [number, number],
  equippedIndex: number,
): Player {
  if (!world.opponent) {
    throw new Error("The world has no opponent.");
  }
  const loadout = world.opponent.loadout.map((carried, index) => ({
    ...carried,
    rounds: rounds[index] ?? 0,
    reserve: reserves[index] ?? 0,
  }));

  return {...world.opponent, loadout, equippedIndex};
}
