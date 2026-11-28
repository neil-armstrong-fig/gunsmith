import type {BaseChatModel} from "@langchain/core/language_models/chat_models";
import {generateAppearance} from "@gunsmith/ai/pipeline/appearance/GenerateAppearance";
import type {WeaponGraphStateValues} from "@gunsmith/ai/pipeline/weapon/graph/state/types/WeaponGraphStateValues";
import type {WeaponGraphUpdate} from "@gunsmith/ai/pipeline/weapon/graph/state/types/WeaponGraphUpdate";

/**
 * Draws a weapon whose stats have passed. The drawing is its own pipeline, with its own repair and its own disclosed stand-in, so a
 * drawing that cannot be made still leaves a created weapon; it reads the player's words and never the weapon, and so can never
 * change a stat. Its own steps are added to the trail with an `appearance.` prefix, and its model calls to the count.
 */
export async function appearanceNode(
  state: WeaponGraphStateValues,
  appearanceGenerator: BaseChatModel,
): Promise<WeaponGraphUpdate> {
  const appearance = await generateAppearance({prompt: state.prompt}, {generator: appearanceGenerator});

  return {
    appearance,
    nodes: appearance.nodes.map(node => `appearance.${node}`),
    modelCalls: appearance.modelCalls,
  };
}
