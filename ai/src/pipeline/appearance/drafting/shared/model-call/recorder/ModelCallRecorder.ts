import {BaseCallbackHandler} from "@langchain/core/callbacks/base";
import {AIMessage} from "@langchain/core/messages";
import type {LLMResult} from "@langchain/core/outputs";

/**
 * Watches one model call finish and keeps what the pipeline needs from it that a structured-output call does not hand back: the
 * tokens the model reported, and the arguments of its tool call exactly as the model wrote them. The second is what lets a
 * drawing the loose schema refuses (a field of the wrong type) still reach the strict check and the repair, which would otherwise see
 * nothing. It works for any model, which `includeRaw` does not (LangChain's generic path ignores it).
 */
export class ModelCallRecorder extends BaseCallbackHandler {
  name = "ModelCallRecorder";
  inputTokens = 0;
  outputTokens = 0;
  toolCallArguments: unknown = undefined;

  override handleLLMEnd(output: LLMResult): void {
    const generation = output.generations[0]?.[0];
    const message = generation !== undefined && "message" in generation ? generation.message : undefined;
    if (!AIMessage.isInstance(message)) {
      return;
    }

    this.inputTokens = message.usage_metadata?.input_tokens ?? 0;
    this.outputTokens = message.usage_metadata?.output_tokens ?? 0;
    this.toolCallArguments = message.tool_calls?.[0]?.args;
  }
}
