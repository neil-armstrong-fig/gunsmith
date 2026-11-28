import {weaponGraphStateOf} from "@gunsmith/ai/pipeline/weapon/graph/testing/WeaponGraphStateOf";
import {balanceNode} from "@gunsmith/ai/pipeline/weapon/graph/checking/BalanceNode";

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

const MAXIMUM = {
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

const NO_PREFERENCE = {favoured: [], sacrificed: []};

it("leaves a weapon that is already inside the limits as it was", () => {
  const update = balanceNode(weaponGraphStateOf({candidate: {weapon: RIFLE, preference: NO_PREFERENCE}}));

  expect(update).toEqual({weapon: RIFLE, codeEdits: 0, nodes: ["balance"]});
});

it("brings a weapon over the limits inside them instead of refusing it", () => {
  const update = balanceNode(weaponGraphStateOf({candidate: {weapon: MAXIMUM, preference: NO_PREFERENCE}}));

  expect(update.nodes).toEqual(["balance"]);
  expect(update.weapon?.bulletDamage).toBeLessThan(100);
});

it("counts one edit when code brings the vision range down to its cap", () => {
  const weapon = {...RIFLE, visionRange: 21};
  const update = balanceNode(weaponGraphStateOf({candidate: {weapon, preference: NO_PREFERENCE}}));

  expect(update.weapon).toEqual({...RIFLE, visionRange: 20});
  expect(update).toHaveProperty("codeEdits", 1);
});

it("balances by the player's preference", () => {
  const neutral = balanceNode(weaponGraphStateOf({candidate: {weapon: MAXIMUM, preference: NO_PREFERENCE}}));
  const favouring = balanceNode(
    weaponGraphStateOf({candidate: {weapon: MAXIMUM, preference: {favoured: ["damage"], sacrificed: []}}}),
  );

  expect(favouring.weapon?.bulletDamage).toBeGreaterThan(neutral.weapon?.bulletDamage ?? 100);
});

it("will not run before validate has passed", () => {
  expect(() => balanceNode(weaponGraphStateOf())).toThrow("balance");
});
