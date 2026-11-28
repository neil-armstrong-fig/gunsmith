import {createArenaModels} from "@gunsmith/ai/adapter/arena/CreateArenaModels";
import {paidModelOptions} from "@evals/eval-criteria-mapping/environment/tier/paid/PaidModelOptions";
import type {PaidArenaModels} from "@evals/eval-criteria-mapping/setups/arena/paid/models/types/PaidArenaModels";

/** The production adapter's two arena models, behind the one spend guard (`paidModelOptions`, which also loads the key). */
export function createPaidArenaModels(): PaidArenaModels {
  return createArenaModels(paidModelOptions());
}
