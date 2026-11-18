import {BURST_SECONDS} from "@src/sound/burst-window/BurstSeconds";
import {DamageCrunch} from "@src/sound/damage-crunch/DamageCrunch";
import type {CrunchRequest} from "@src/sound/damage-crunch/types/CrunchRequest";

const TICK = 1 / 60;
const BULLET: CrunchRequest = {
  events: [{kind: "damageTaken", cause: "bullet", amount: 20}],
  round: "playing",
  seconds: TICK,
};
const RING: CrunchRequest = {
  events: [{kind: "damageTaken", cause: "ring", amount: 0.2}],
  round: "playing",
  seconds: TICK,
};
const QUIET: CrunchRequest = {events: undefined, round: "playing", seconds: TICK};

const STEPS_IN_BURST = Math.round(BURST_SECONDS / TICK);

it("crunches at once for a bullet that hits", () => {
  expect(crunchesOf([BULLET])).toEqual([0]);
});

it("crunches for nothing else", () => {
  expect(crunchesOf([QUIET, {...QUIET, events: [{kind: "fireRefused", reason: "empty"}]}])).toEqual([]);
});

it("merges a second hit inside the burst into the first crunch", () => {
  expect(crunchesOf([BULLET, ...quiet(STEPS_IN_BURST - 2), BULLET])).toEqual([0]);
});

it("does not crunch for the ring, however long it keeps hurting", () => {
  expect(crunchesOf([RING, RING, RING, QUIET, RING])).toEqual([]);
});

it("crunches for a bullet that lands while the ring is hurting, and for that alone", () => {
  const bulletInRing: CrunchRequest = {...BULLET, events: [...(BULLET.events ?? []), ...(RING.events ?? [])]};

  expect(crunchesOf([RING, RING, bulletInRing, RING])).toEqual([2]);
});

it("crunches for a hit that ends the round, and for nothing after it", () => {
  const fatal: CrunchRequest = {...BULLET, round: "lost"};
  const after: CrunchRequest = {events: undefined, round: "lost", seconds: TICK};

  expect(crunchesOf([fatal, after, after])).toEqual([0]);
});

/** Runs one step per request and says which of them crunched, by position. */
function crunchesOf(requests: readonly CrunchRequest[]): number[] {
  const crunch = new DamageCrunch();

  return requests.flatMap((request, index) => {
    if (crunch.shouldPlay(request)) {
      return [index];
    }

    return [];
  });
}

/** `count` quiet steps. */
function quiet(count: number): CrunchRequest[] {
  return Array.from({length: count}, () => QUIET);
}
