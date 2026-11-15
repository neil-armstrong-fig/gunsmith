import {checkWeaponDraft} from "@gunsmith/ai/pipeline/check/CheckWeaponDraft";

// Balancing never leaves a weapon over a limit, so the backstop behind it can only be reached by a balancer that fails. This file
// stands in one that does, to prove `rate` still refuses what it is handed and the path says so.
vi.mock("@gunsmith/ai/pipeline/check/balance/BalanceWeaponDraft", () => ({
  balanceWeaponDraft: (weapon: unknown) => weapon,
}));

const TOO_STRONG = {
  name: "Everything",
  bulletDamage: 100,
  fireIntervalSeconds: 0.05,
  bulletSpeed: 60,
  magazineSize: 60,
  reloadSeconds: 0.5,
  startingReserve: 200,
};

it("refuses a weapon that balancing left over a limit, and says balance ran before rate", () => {
  const check = checkWeaponDraft(TOO_STRONG);

  expect(check.ok).toBe(false);
  expect(check.nodes).toEqual(["validate", "balance", "rate"]);
  expect(check.ok ? [] : check.errors).toHaveLength(2);
});
