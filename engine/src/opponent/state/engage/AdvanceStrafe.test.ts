import {DIFFICULTY} from "@gunsmith/engine/opponent/Difficulty";
import {advanceStrafe} from "@gunsmith/engine/opponent/state/engage/AdvanceStrafe";
import {startingBrain} from "@gunsmith/engine/opponent/StartingBrain";
import type {OpponentBrain} from "@gunsmith/engine/opponent/types/OpponentBrain";

const TICK = 1 / 60;
const circling: OpponentBrain = {
  ...startingBrain({seed: 6, position: {x: 0, y: 0}}),
  strafeSide: 1,
  strafeRemainingSeconds: 1.5,
};

it("counts the time on this side down, and changes nothing else", () => {
  const brain = advanceStrafe(circling, TICK);

  expect(brain.strafeRemainingSeconds).toBeCloseTo(1.5 - TICK, 9);
  expect(brain.strafeSide).toBe(1);
  expect(brain.seed).toBe(6);
});

it("goes the other way when the time is up", () => {
  expect(advanceStrafe({...circling, strafeRemainingSeconds: TICK / 2}, TICK).strafeSide).toBe(-1);
  expect(advanceStrafe({...circling, strafeSide: -1, strafeRemainingSeconds: 0}, TICK).strafeSide).toBe(1);
});

it("holds the new side for a time between the shortest and the longest, drawn from the seed", () => {
  let seed = 1;
  for (let index = 0; index < 100; index++) {
    const brain = advanceStrafe({...circling, seed, strafeRemainingSeconds: 0}, TICK);
    seed = brain.seed;

    expect(brain.strafeRemainingSeconds).toBeGreaterThanOrEqual(DIFFICULTY.strafeMinSeconds);
    expect(brain.strafeRemainingSeconds).toBeLessThanOrEqual(DIFFICULTY.strafeMaxSeconds);
  }
});

it("does not hold every side for the same time", () => {
  const times = new Set<number>();
  let seed = 1;
  for (let index = 0; index < 20; index++) {
    const brain = advanceStrafe({...circling, seed, strafeRemainingSeconds: 0}, TICK);
    seed = brain.seed;
    times.add(brain.strafeRemainingSeconds);
  }

  expect(times.size).toBeGreaterThan(10);
});

it("moves the seed on when it draws a time", () => {
  expect(advanceStrafe({...circling, strafeRemainingSeconds: 0}, TICK).seed).not.toBe(6);
});
