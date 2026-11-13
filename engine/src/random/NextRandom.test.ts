import {nextRandom} from "@gunsmith/engine/random/NextRandom";
import type {RandomDraw} from "@gunsmith/engine/random/types/RandomDraw";

it("gives the same draw for the same seed", () => {
  expect(nextRandom(12345)).toEqual(nextRandom(12345));
});

it("gives a value from zero up to, but not including, one", () => {
  let draw: RandomDraw = {value: 0, seed: 7};
  for (let index = 0; index < 1000; index++) {
    draw = nextRandom(draw.seed);
    expect(draw.value).toBeGreaterThanOrEqual(0);
    expect(draw.value).toBeLessThan(1);
  }
});

it("returns a new seed, so the next draw is a different one", () => {
  const first = nextRandom(99);
  const second = nextRandom(first.seed);

  expect(first.seed).not.toBe(99);
  expect(second.seed).not.toBe(first.seed);
  expect(second.value).not.toBe(first.value);
});

it("gives different values for different seeds", () => {
  expect(nextRandom(1).value).not.toBe(nextRandom(2).value);
});

it("spreads its values across the range", () => {
  let draw: RandomDraw = {value: 0, seed: 2024};
  let below = 0;
  for (let index = 0; index < 2000; index++) {
    draw = nextRandom(draw.seed);
    if (draw.value < 0.5) {
      below++;
    }
  }

  expect(below).toBeGreaterThan(900);
  expect(below).toBeLessThan(1100);
});

it("never leaves the seed a non-integer, so it survives a round trip through JSON", () => {
  const draw = nextRandom(0.5 * 2 ** 32);

  expect(Number.isInteger(draw.seed)).toBe(true);
  expect(nextRandom(JSON.parse(JSON.stringify(draw.seed)) as number)).toEqual(nextRandom(draw.seed));
});
