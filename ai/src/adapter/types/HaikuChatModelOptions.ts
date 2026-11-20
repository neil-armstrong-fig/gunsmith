import type {AnthropicModelOptions} from "@gunsmith/ai/adapter/types/AnthropicModelOptions";

/** One model's settings: the shared ones, and the most it may write. */
export interface HaikuChatModelOptions extends AnthropicModelOptions {
  maxTokens: number;
}
