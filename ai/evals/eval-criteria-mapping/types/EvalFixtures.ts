import type {WeaponSmithDsl} from "@evals/dsl/WeaponSmithDsl";

/** What a `beforeAll` or a `then` is handed: the DSL, and nothing else. No driver, no pipeline, no model, no evaluator. */
export interface EvalFixtures {
  weaponSmith: WeaponSmithDsl;
}
