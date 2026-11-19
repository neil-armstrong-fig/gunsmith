import type {EvalDrivers} from "@evals/dsl/types/EvalDrivers";
import {WeaponSmithDsl} from "@evals/dsl/WeaponSmithDsl";

it("holds one DSL for each domain, each on that domain's own driver", () => {
  const weaponSmith = new WeaponSmithDsl(driversWithTrials({weapon: 3, appearance: 2, arena: 1, arenaSubmission: 4}));

  expect(weaponSmith.weapon.domain).toBe("weapon");
  expect(weaponSmith.weapon.trials).toBe(3);
  expect(weaponSmith.appearance.domain).toBe("appearance");
  expect(weaponSmith.appearance.trials).toBe(2);
  expect(weaponSmith.arena.domain).toBe("arena");
  expect(weaponSmith.arena.trials).toBe(1);
  expect(weaponSmith.arenaSubmission.domain).toBe("arenaSubmission");
  expect(weaponSmith.arenaSubmission.trials).toBe(4);
});

function driversWithTrials(trials: Record<keyof EvalDrivers, number>): EvalDrivers {
  return {
    weapon: {trials: trials.weapon, run: () => Promise.reject(new Error("not asked"))},
    appearance: {trials: trials.appearance, run: () => Promise.reject(new Error("not asked"))},
    arena: {trials: trials.arena, run: () => Promise.reject(new Error("not asked"))},
    arenaSubmission: {trials: trials.arenaSubmission, run: () => Promise.reject(new Error("not asked"))},
  };
}
