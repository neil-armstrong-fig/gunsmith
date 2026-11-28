import type {ChatAnthropic} from "@langchain/anthropic";
import {createAppearanceModel} from "@gunsmith/ai/adapter/appearance/CreateAppearanceModel";
import {paidModelOptions} from "@evals/eval-criteria-mapping/environment/tier/paid/PaidModelOptions";

/** The production adapter's drawing model, behind the spend guard (`paidModelOptions`). */
export function createPaidAppearanceModel(): ChatAnthropic {
  return createAppearanceModel(paidModelOptions());
}
