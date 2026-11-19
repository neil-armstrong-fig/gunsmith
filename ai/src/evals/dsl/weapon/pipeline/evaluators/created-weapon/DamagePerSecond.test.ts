import {damagePerSecondOf} from "@evals/dsl/weapon/pipeline/evaluators/created-weapon/DamagePerSecond";
import {PASSING_WEAPON} from "@evals/dsl/weapon/pipeline/evaluators/testing/weapon/PassingWeapon";

it("works out a weapon's damage per second from its bullet and its fire interval", () => {
  expect(damagePerSecondOf(PASSING_WEAPON)).toBe(120);
});

it("has none for something that is not a weapon", () => {
  expect(damagePerSecondOf("not a weapon")).toBeUndefined();
});
