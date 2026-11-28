import {ChatAnthropic} from "@langchain/anthropic";
import type {HaikuChatModelOptions} from "@gunsmith/ai/adapter/shared/types/HaikuChatModelOptions";
import {HAIKU_MODEL} from "@gunsmith/ai/adapter/shared/haiku/HaikuModel";

/**
 * Haiku 5.5 with **no retries**. LangChain's own caller retries a failed call (a 429, a 5xx, a 529) up to 6 times with backoff,
 * and a callback sees only the call that finally finishes, so `modelCalls` and the usage would undercount attempts and the backoff
 * alone could run past the route's time limit. A transient failure now ends the request, and the route refunds it. The `maxTokens` is
 * a cap, free when unused on Anthropic, and a tool call cut off by it fails to parse, so each model is given far more than it needs.
 * Only `src/adapter/` and `src/evals/` may import `@langchain/anthropic`.
 */
export function createHaikuChatModel(options: HaikuChatModelOptions): ChatAnthropic {
  return new ChatAnthropic({
    model: HAIKU_MODEL,
    apiKey: options.apiKey,
    maxTokens: options.maxTokens,
    maxRetries: 0,
    callbacks: options.callbacks,
  });
}
