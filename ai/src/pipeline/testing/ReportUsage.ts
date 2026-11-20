import type {BaseChatModel} from "@langchain/core/language_models/chat_models";
import {AIMessage} from "@langchain/core/messages";
import type {ModelUsage} from "@gunsmith/ai/pipeline/types/ModelUsage";

/**
 * Makes the model report these tokens on every answer it gives, as a real provider does, so a test can add them up. The model
 * still answers as it did; a fake that reports nothing counts as zero. Test-only.
 */
export function reportUsage(model: BaseChatModel, usage: ModelUsage): void {
  const answer = model._generate.bind(model);

  vi.spyOn(model, "_generate").mockImplementation(async (messages, options, runManager) => {
    const result = await answer(messages, options, runManager);

    for (const generation of result.generations) {
      if (AIMessage.isInstance(generation.message)) {
        generation.message.usage_metadata = {
          input_tokens: usage.inputTokens,
          output_tokens: usage.outputTokens,
          total_tokens: usage.inputTokens + usage.outputTokens,
        };
      }
    }

    return result;
  });
}
