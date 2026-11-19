import type {WeaponSmithDsl} from "@evals/dsl/WeaponSmithDsl";

/**
 * What a `when` is handed: the weapon smith, whose members are the DSLs a spec may talk to, and nothing else. No driver, no pipeline,
 * no model, no evaluator. A `when` takes a member into a scope of its own for each trial (`eachTrial(weaponSmith.weapon, weapon => {…})`).
 */
export interface EvalFixtures {
  weaponSmith: WeaponSmithDsl;
}
