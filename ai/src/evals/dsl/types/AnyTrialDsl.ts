import type {AppearanceDsl} from "@evals/dsl/appearance/AppearanceDsl";
import type {ArenaDsl} from "@evals/dsl/arena/ArenaDsl";
import type {WeaponDsl} from "@evals/dsl/weapon/WeaponDsl";

/** Any of the three DSLs a trial can be given; its `domain` says which, so a check on it narrows the type. */
export type AnyTrialDsl = WeaponDsl | AppearanceDsl | ArenaDsl;
