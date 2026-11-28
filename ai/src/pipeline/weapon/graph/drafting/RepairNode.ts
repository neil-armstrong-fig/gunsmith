import type {BaseChatModel} from "@langchain/core/language_models/chat_models";
import {repairWeaponDraft} from "@gunsmith/ai/pipeline/weapon/drafting/repair/RepairWeaponDraft";
import type {WeaponGraphStateValues} from "@gunsmith/ai/pipeline/weapon/graph/state/types/WeaponGraphStateValues";
import type {WeaponGraphUpdate} from "@gunsmith/ai/pipeline/weapon/graph/state/types/WeaponGraphUpdate";

/**
 * Puts a refused draft back to the model with its first answer and what was wrong with it: one model call, and the one repair
 * is spent, which is what keeps the graph from looping (`continueUnlessRefused` ends the run on a second refusal).
 */
export async function repairNode(state: WeaponGraphStateValues, generator: BaseChatModel): Promise<WeaponGraphUpdate> {
  const draft = await repairWeaponDraft({prompt: state.prompt, previous: state.draft, errors: state.errors}, generator);

  return {draft, repaired: true, nodes: ["repair"], modelCalls: 1};
}
