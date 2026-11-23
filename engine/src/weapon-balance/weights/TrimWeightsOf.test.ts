import {trimWeightsOf} from "@gunsmith/engine/weapon-balance/weights/TrimWeightsOf";

it("weighs every stat the same when there is no preference", () => {
  expect(trimWeightsOf({favoured: [], sacrificed: []})).toEqual({
    damage: 1,
    fireRate: 1,
    bulletSpeed: 1,
    magazineSize: 1,
    reloadSpeed: 1,
    reserve: 1,
    visionCone: 1,
    visionRange: 1,
  });
});

it("trims a favoured stat least and a sacrificed stat most", () => {
  const weights = trimWeightsOf({favoured: ["damage"], sacrificed: ["reserve"]});

  expect(weights.damage).toBeLessThan(weights.fireRate);
  expect(weights.reserve).toBeGreaterThan(weights.fireRate);
});

it("counts a stat that is both favoured and sacrificed as neither", () => {
  const weights = trimWeightsOf({favoured: ["damage"], sacrificed: ["damage"]});

  expect(weights.damage).toBe(weights.fireRate);
});

it("leaves the stats a preference does not name at the neutral weight", () => {
  const weights = trimWeightsOf({favoured: ["damage"], sacrificed: ["reserve"]});

  expect(weights.fireRate).toBe(1);
  expect(weights.bulletSpeed).toBe(1);
  expect(weights.magazineSize).toBe(1);
  expect(weights.reloadSpeed).toBe(1);
  expect(weights.visionCone).toBe(1);
  expect(weights.visionRange).toBe(1);
});

it("weighs the two vision stats on their own, so a player can favour the range and give up the cone", () => {
  const weights = trimWeightsOf({favoured: ["visionRange"], sacrificed: ["visionCone"]});

  expect(weights.visionRange).toBeLessThan(weights.damage);
  expect(weights.visionCone).toBeGreaterThan(weights.damage);
});
