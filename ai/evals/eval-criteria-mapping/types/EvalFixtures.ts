import type {ArenaDsl} from "@evals/dsl/arena/ArenaDsl";
import type {AppearanceDsl} from "@evals/dsl/appearance/AppearanceDsl";
import type {WeaponSmithDsl} from "@evals/dsl/WeaponSmithDsl";

/**
 * What a `when` is handed: each DSL a spec may talk to, and nothing else. No driver, no pipeline, no model, no evaluator. A `when`
 * takes the ones it uses by name (`when("…", ({appearance}) => {…})`), which is how the mapping knows whose standing criteria it carries.
 */
export interface EvalFixtures {
  weaponSmith: WeaponSmithDsl;
  appearance: AppearanceDsl;
  arena: ArenaDsl;
}
