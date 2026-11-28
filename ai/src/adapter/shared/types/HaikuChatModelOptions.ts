import type {AnthropicModelOptions} from "@gunsmith/ai/adapter/shared/types/AnthropicModelOptions";

/** One model's settings: the shared ones, and the most it may write. */
export interface HaikuChatModelOptions extends AnthropicModelOptions {
  maxTokens: number;
}
