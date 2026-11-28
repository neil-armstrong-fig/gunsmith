import {BaseCallbackHandler} from "@langchain/core/callbacks/base";
import {AIMessage} from "@langchain/core/messages";
import type {LLMResult} from "@langchain/core/outputs";
import type {ModelUsage} from "@gunsmith/ai/pipeline/shared/usage/types/ModelUsage";

/**
 * Adds up the tokens every model call of one request reported, whichever stage made it: handed to the graph's `invoke` as a
 * callback, it sees the calls of every node, repairs and the drawing included, each once. A call that failed reports nothing and is
 * not billed. One instance per request, never reused. `awaitHandlers` makes the graph wait for each report, so the total is whole
 * when the request returns (LangChain otherwise runs handlers in the background).
 */
export class RequestUsage extends BaseCallbackHandler {
  name = "RequestUsage";
  override awaitHandlers = true;
  private inputTokens = 0;
  private outputTokens = 0;

  override handleLLMEnd(output: LLMResult): void {
    const generation = output.generations[0]?.[0];
    const message = generation !== undefined && "message" in generation ? generation.message : undefined;
    if (!AIMessage.isInstance(message)) {
      return;
    }

    this.inputTokens += message.usage_metadata?.input_tokens ?? 0;
    this.outputTokens += message.usage_metadata?.output_tokens ?? 0;
  }

  /** Adds tokens that were counted somewhere the collector cannot see, such as the drawing's own calls. */
  add(usage: ModelUsage): void {
    this.inputTokens += usage.inputTokens;
    this.outputTokens += usage.outputTokens;
  }

  total(): ModelUsage {
    return {inputTokens: this.inputTokens, outputTokens: this.outputTokens};
  }
}
