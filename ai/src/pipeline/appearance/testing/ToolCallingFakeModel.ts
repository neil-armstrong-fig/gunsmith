import {BaseChatModel} from "@langchain/core/language_models/chat_models";
import {AIMessage} from "@langchain/core/messages";
import type {BaseMessage} from "@langchain/core/messages";
import type {ChatResult} from "@langchain/core/outputs";
import type {ModelUsage} from "@gunsmith/ai/pipeline/types/ModelUsage";

/** How a fake model answers: what each call returns (the last one is repeated), and what each call reports it cost. */
export interface ToolCallingFakeOptions {
  /** One entry per call: the arguments the model "writes" into its tool call, or `undefined` for a call that makes no tool call at all. */
  answers: unknown[];
  usage?: ModelUsage;
}

/**
 * A fake chat model that answers the way a real one does for `withStructuredOutput(..., {method: "functionCalling"})`: with a tool
 * call whose arguments are the answer, and with token usage on the message. It keeps what it was sent, so a test can read the
 * messages a node built. Test-only.
 */
export class ToolCallingFakeModel extends BaseChatModel {
  readonly seen: BaseMessage[][] = [];
  private readonly options: ToolCallingFakeOptions;
  private calls = 0;

  constructor(options: ToolCallingFakeOptions) {
    super({});
    this.options = options;
  }

  _llmType(): string {
    return "tool-calling-fake";
  }

  override bindTools(): this {
    return this;
  }

  async _generate(messages: BaseMessage[]): Promise<ChatResult> {
    this.seen.push(messages);
    const answer = this.options.answers[Math.min(this.calls, this.options.answers.length - 1)];
    this.calls += 1;
    const usage = this.options.usage ?? {inputTokens: 0, outputTokens: 0};
    const message = new AIMessage({
      content: "",
      tool_calls:
        answer === undefined
          ? []
          : [{name: "extract", args: answer as Record<string, unknown>, id: `call-${this.calls}`, type: "tool_call"}],
      usage_metadata: {
        input_tokens: usage.inputTokens,
        output_tokens: usage.outputTokens,
        total_tokens: usage.inputTokens + usage.outputTokens,
      },
    });

    return {generations: [{text: "", message}]};
  }
}
