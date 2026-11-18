import {AIMessage} from "@langchain/core/messages";
import type {ChatGeneration, LLMResult} from "@langchain/core/outputs";

/** What LangChain hands the guard when a chat call ends: the tokens it reported and, when given, why it stopped. Test-only. */
export function finishedCall(inputTokens: number, outputTokens: number, stopReason?: string): LLMResult {
  const message = new AIMessage({
    content: "",
    usage_metadata: {input_tokens: inputTokens, output_tokens: outputTokens, total_tokens: inputTokens + outputTokens},
    response_metadata: stopReason === undefined ? {} : {stop_reason: stopReason},
  });
  const generation: ChatGeneration = {text: "", message};

  return {generations: [[generation]]};
}
