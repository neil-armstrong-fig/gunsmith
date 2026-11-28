import type {ChatAnthropic} from "@langchain/anthropic";
import type {AnthropicModelOptions} from "@gunsmith/ai/adapter/shared/types/AnthropicModelOptions";
import {createHaikuChatModel} from "@gunsmith/ai/adapter/shared/haiku/CreateHaikuChatModel";

// A drawing is far longer than a weapon or a verdict, and `maxTokens` is only a cap on Anthropic.
const APPEARANCE_MAX_TOKENS = 3000;

/** The model that draws a weapon: Haiku 5.5 with room for a long drawing and a repair of it. */
export function createAppearanceModel(options: AnthropicModelOptions): ChatAnthropic {
  return createHaikuChatModel({...options, maxTokens: APPEARANCE_MAX_TOKENS});
}
