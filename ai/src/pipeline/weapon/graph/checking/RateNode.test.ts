import {weaponGraphStateOf} from "@gunsmith/ai/pipeline/weapon/graph/testing/WeaponGraphStateOf";
import {rateNode} from "@gunsmith/ai/pipeline/weapon/graph/checking/RateNode";

const RIFLE = {
  name: "Proof Rifle",
  bulletDamage: 25,
  fireIntervalSeconds: 0.2,
  bulletSpeed: 20,
  magazineSize: 12,
  reloadSeconds: 1.5,
  startingReserve: 36,
  visionDegrees: 90,
  visionRange: 12,
};

const TOO_STRONG = {
  name: "Everything",
  bulletDamage: 100,
  fireIntervalSeconds: 0.05,
  bulletSpeed: 60,
  magazineSize: 60,
  reloadSeconds: 0.5,
  startingReserve: 200,
  visionDegrees: 130,
  visionRange: 20,
};

it("passes a weapon inside both limits, noting only that it ran", () => {
  expect(rateNode(weaponGraphStateOf({weapon: RIFLE}))).toEqual({nodes: ["rate"]});
});

it("refuses a weapon over a limit, saying why, and leaves the weapon alone", () => {
  const update = rateNode(weaponGraphStateOf({weapon: TOO_STRONG}));

  expect(update.nodes).toEqual(["rate"]);
  expect(update.errors).toHaveLength(2);
  expect(update.weapon).toBeUndefined();
});

it("will not run before balance has produced a weapon", () => {
  expect(() => rateNode(weaponGraphStateOf())).toThrow("rate");
});
