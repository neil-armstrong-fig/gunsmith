import type {BaseChatModel} from "@langchain/core/language_models/chat_models";
import {generateWeaponDraft} from "@gunsmith/ai/pipeline/weapon-drafting/generate/GenerateWeaponDraft";
import type {
  WeaponGraphStateValues,
  WeaponGraphUpdate,
} from "@gunsmith/ai/pipeline/weapon-graph/state/WeaponGraphState";

/** Has the strong model write the weapon from the player's words: one model call, and what comes back stays `unknown` until `validate`. */
export async function generateNode(
  state: WeaponGraphStateValues,
  generator: BaseChatModel,
): Promise<WeaponGraphUpdate> {
  const draft = await generateWeaponDraft(state.prompt, generator);

  return {draft, nodes: ["generate"], modelCalls: 1};
}
