import {createWeaponModels} from "@gunsmith/ai/adapter/CreateWeaponModels";
import {paidModelOptions} from "@evals/eval-criteria-mapping/environment/tier/paid/PaidModelOptions";
import type {PaidWeaponModels} from "@evals/eval-criteria-mapping/setups/weapon/paid/models/types/PaidWeaponModels";

/** The production adapter's three weapon models, behind the one spend guard (`paidModelOptions`, which also loads the key). */
export function createPaidWeaponModels(): PaidWeaponModels {
  return createWeaponModels(paidModelOptions());
}
