import {DIFFICULTY} from "@gunsmith/engine/opponent/Difficulty";
import {advanceBurst} from "@gunsmith/engine/opponent/state/acting/engage/AdvanceBurst";
import {startingBrain} from "@gunsmith/engine/opponent/brain/StartingBrain";
import type {OpponentBrain} from "@gunsmith/engine/opponent/types/OpponentBrain";

const TICK = 1 / 60;
const INTERVAL = 0.2;
const BURST_SECONDS = (DIFFICULTY.burstShots - 0.5) * INTERVAL;
const ready: OpponentBrain = {
  ...startingBrain({seed: 4, position: {x: 0, y: 0}}),
  state: "engage",
  reactionRemainingSeconds: 0,
};

function advance(brain: OpponentBrain): ReturnType<typeof advanceBurst> {
  return advanceBurst(brain, {fireIntervalSeconds: INTERVAL, seconds: TICK});
}

it("holds its fire while it waits out its reaction time, and counts the wait down", () => {
  const result = advance({...ready, reactionRemainingSeconds: 0.3});

  expect(result.firing).toBe(false);
  expect(result.brain.reactionRemainingSeconds).toBeCloseTo(0.3 - TICK, 9);
  expect(result.brain.fireRemainingSeconds).toBe(0);
});

it("does not fire on the step the reaction time runs out, but on the next", () => {
  const last = advance({...ready, reactionRemainingSeconds: TICK / 2});

  expect(last.firing).toBe(false);
  expect(last.brain.reactionRemainingSeconds).toBe(0);
  expect(advance(last.brain).firing).toBe(true);
});

it("starts a burst when it is ready, with the trigger down for as long as the weapon takes to fire its shots", () => {
  const result = advance(ready);

  expect(result.firing).toBe(true);
  expect(result.brain.fireRemainingSeconds).toBeCloseTo(BURST_SECONDS - TICK, 9);
});

it("draws a new aim roll for each burst, from the seed", () => {
  const result = advance(ready);

  expect(result.brain.aimRoll).toBeGreaterThanOrEqual(-1);
  expect(result.brain.aimRoll).toBeLessThanOrEqual(1);
  expect(result.brain.seed).not.toBe(ready.seed);
});

it("keeps the same roll, and the same seed, all through a burst", () => {
  const started = advance(ready).brain;
  const later = advance(started).brain;

  expect(later.aimRoll).toBe(started.aimRoll);
  expect(later.seed).toBe(started.seed);
});

it("keeps firing through the burst and counts it down", () => {
  const result = advance({...ready, fireRemainingSeconds: 0.3});

  expect(result.firing).toBe(true);
  expect(result.brain.fireRemainingSeconds).toBeCloseTo(0.3 - TICK, 9);
});

it("lets go of the trigger and starts to rest as the burst runs out", () => {
  const result = advance({...ready, fireRemainingSeconds: TICK / 2});

  expect(result.firing).toBe(true);
  expect(result.brain.fireRemainingSeconds).toBe(0);
  expect(result.brain.restRemainingSeconds).toBe(DIFFICULTY.restSeconds);
});

it("holds its fire while it rests, and counts the rest down", () => {
  const result = advance({...ready, restRemainingSeconds: 0.5});

  expect(result.firing).toBe(false);
  expect(result.brain.restRemainingSeconds).toBeCloseTo(0.5 - TICK, 9);
});

it("starts its next burst on the step after the rest runs out", () => {
  const rested = advance({...ready, restRemainingSeconds: TICK / 2});

  expect(rested.firing).toBe(false);
  expect(rested.brain.restRemainingSeconds).toBe(0);
  expect(advance(rested.brain).firing).toBe(true);
});

it("fires for a burst and rests for the rest, over and over", () => {
  let brain = ready;
  let firingTicks = 0;
  let bursts = 0;
  let wasFiring = false;
  const ticks = Math.round(30 / TICK);
  for (let tick = 0; tick < ticks; tick++) {
    const result = advance(brain);
    brain = result.brain;
    if (result.firing) {
      firingTicks++;
      if (!wasFiring) {
        bursts++;
      }
    }
    wasFiring = result.firing;
  }

  const cycle = BURST_SECONDS + DIFFICULTY.restSeconds;
  expect(bursts).toBeGreaterThanOrEqual(Math.floor(30 / cycle) - 1);
  expect(bursts).toBeLessThanOrEqual(Math.ceil(30 / cycle) + 1);
  expect(firingTicks * TICK).toBeCloseTo(bursts * BURST_SECONDS, 0);
});

it("gives the same answer for the same brain", () => {
  expect(advance(ready)).toEqual(advance(ready));
});

it("draws rolls that miss to the left and to the right, across the seeds", () => {
  const rolls = Array.from({length: 40}, (_, index) => advance({...ready, seed: index + 1}).brain.aimRoll);

  expect(Math.min(...rolls)).toBeLessThan(-0.5);
  expect(Math.max(...rolls)).toBeGreaterThan(0.5);
});
