import type {BaseChatModel} from "@langchain/core/language_models/chat_models";
import {generateAppearance} from "@gunsmith/ai/pipeline/appearance/GenerateAppearance";
import type {WeaponOutcome} from "@gunsmith/ai/pipeline/types/WeaponOutcome";
import type {WeaponToDraw} from "@gunsmith/ai/pipeline/weapon-drawing/types/WeaponToDraw";

/**
 * Draws a weapon whose stats have passed, and returns the `created` outcome that carries both. The drawing is its own pipeline with
 * its own repair and its own disclosed stand-in, so a drawing that cannot be made still leaves a created weapon: the stats are
 * handed through untouched, and the drawing's nodes and model calls are added to the stats stage's own.
 */
export async function drawCreatedWeapon(
  weaponToDraw: WeaponToDraw,
  appearanceGenerator: BaseChatModel,
): Promise<WeaponOutcome> {
  const appearance = await generateAppearance({prompt: weaponToDraw.prompt}, {generator: appearanceGenerator});

  return {
    status: "created",
    weapon: weaponToDraw.weapon,
    appearance,
    nodes: [...weaponToDraw.nodes, ...appearance.nodes.map(node => `appearance.${node}`)],
    modelCalls: weaponToDraw.modelCalls + appearance.modelCalls,
  };
}
