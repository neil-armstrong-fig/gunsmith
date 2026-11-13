import type {WeaponSmithDsl} from "@evals/dsl/WeaponSmithDsl";
import type {EvalSuite} from "@evals/eval-criteria-mapping/types/EvalSuite";

/** The `when` whose body is being defined: where a `beforeAll` and a `then` find their DSL, their suite and their place in the report. */
export interface WhenContext {
  given: string;
  description: string;
  suite: EvalSuite;
  /** One per `when`, so its `then`s share the answers its `beforeAll` asked for, and no other `when` does. */
  weaponSmith: WeaponSmithDsl;
}
