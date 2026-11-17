import {goodnessOf} from "@gunsmith/engine/power-rating/goodness/GoodnessOf";
import {STRONGEST_STATS} from "@gunsmith/engine/power-rating/testing/StrongestStats";
import {WEAKEST_STATS} from "@gunsmith/engine/power-rating/testing/WeakestStats";
import {STAT_NAMES} from "@gunsmith/engine/power-rating/types/StatName";

it("is 0 for every stat at its weakest value", () => {
  const goodness = goodnessOf(WEAKEST_STATS);

  for (const stat of STAT_NAMES) {
    expect(goodness[stat], stat).toBeCloseTo(0, 9);
  }
});

it("is 1 for every stat at its strongest value", () => {
  const goodness = goodnessOf(STRONGEST_STATS);

  for (const stat of STAT_NAMES) {
    expect(goodness[stat], stat).toBeCloseTo(1, 9);
  }
});

it("puts damage 10 half way between 1 and 100, because damage is judged by how many times over it is", () => {
  expect(goodnessOf({...WEAKEST_STATS, bulletDamage: 10}).damage).toBeCloseTo(0.5, 9);
});

it("judges fire rate in shots a second, so a shorter interval is better", () => {
  const quick = goodnessOf({...WEAKEST_STATS, fireIntervalSeconds: 0.1}).fireRate;
  const slow = goodnessOf({...WEAKEST_STATS, fireIntervalSeconds: 1}).fireRate;

  expect(quick).toBeGreaterThan(slow);
});

it("puts a fire interval of 1 over the square root of 10 half way, because fire rate is judged by how many times over it is", () => {
  expect(goodnessOf({...WEAKEST_STATS, fireIntervalSeconds: 1 / Math.sqrt(10)}).fireRate).toBeCloseTo(0.5, 9);
});

it("puts a bullet speed of 32.5 half way between 5 and 60", () => {
  expect(goodnessOf({...WEAKEST_STATS, bulletSpeed: 32.5}).bulletSpeed).toBeCloseTo(0.5, 9);
});

it("puts a magazine of 60 over the square root of 60 half way, because magazine size is judged by how many times over it is", () => {
  expect(goodnessOf({...WEAKEST_STATS, magazineSize: Math.sqrt(60)}).magazineSize).toBeCloseTo(0.5, 9);
});

it("judges reload speed as reloads a second, so a shorter reload is better", () => {
  const quick = goodnessOf({...WEAKEST_STATS, reloadSeconds: 1}).reloadSpeed;
  const slow = goodnessOf({...WEAKEST_STATS, reloadSeconds: 4}).reloadSpeed;

  expect(quick).toBeGreaterThan(slow);
});

it("puts a reserve of 100 half way between 0 and 200", () => {
  expect(goodnessOf({...WEAKEST_STATS, startingReserve: 100}).reserve).toBeCloseTo(0.5, 9);
});

it("keeps a value past its range at 0 or 1, so a stray number cannot rate off the scale", () => {
  const goodness = goodnessOf({...STRONGEST_STATS, bulletDamage: 5000, startingReserve: 9999, reloadSeconds: 0.01});

  expect(goodness.damage).toBe(1);
  expect(goodness.reserve).toBe(1);
  expect(goodness.reloadSpeed).toBe(1);
  expect(goodnessOf({...WEAKEST_STATS, bulletDamage: 0.1, bulletSpeed: -3}).damage).toBe(0);
  expect(goodnessOf({...WEAKEST_STATS, bulletSpeed: -3}).bulletSpeed).toBe(0);
});
