import type {AnthropicModelOptions} from "@gunsmith/ai/adapter/types/AnthropicModelOptions";
import type {WeaponModels} from "@gunsmith/ai/adapter/types/WeaponModels";
import {createAppearanceModel} from "@gunsmith/ai/adapter/CreateAppearanceModel";
import {createHaikuChatModel} from "@gunsmith/ai/adapter/haiku/CreateHaikuChatModel";

// Far more than a weapon (about a hundred tokens) or a verdict needs. On Anthropic `maxTokens` is only a cap and costs nothing
// unused, whereas a tool call cut off by it fails to parse: moderation then fails closed and a request would be turned away as
// "not a weapon", which a report reads as a model that over-rejects.
const WEAPON_MAX_TOKENS = 2000;

/** The three models the weapon pipeline is handed: the one that writes, the one that judges and the one that draws. */
export function createWeaponModels(options: AnthropicModelOptions): WeaponModels {
  return {
    generator: createHaikuChatModel({...options, maxTokens: WEAPON_MAX_TOKENS}),
    moderator: createHaikuChatModel({...options, maxTokens: WEAPON_MAX_TOKENS}),
    appearanceGenerator: createAppearanceModel(options),
  };
}
