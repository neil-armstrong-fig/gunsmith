import {BaseCallbackHandler} from "@langchain/core/callbacks/base";
import {AIMessage} from "@langchain/core/messages";
import type {LLMResult} from "@langchain/core/outputs";
import {haikuCost} from "@evals/eval-criteria-mapping/tier/paid/spend/HaikuCost";
import type {SpendLedger} from "@evals/eval-criteria-mapping/tier/paid/spend/SpendLedger";
import type {PaidCall} from "@evals/eval-criteria-mapping/tier/paid/spend/types/PaidCall";

/**
 * The paid tier's spend guard: it counts every call into the ledger from the tokens the model reports, and stops a call from
 * starting once the ceiling is reached. `raiseError` is what makes LangChain pass the stop on instead of logging it.
 */
export class SpendGuard extends BaseCallbackHandler {
  name = "SpendGuard";
  override raiseError = true;

  constructor(private readonly ledger: SpendLedger) {
    super();
  }

  private failure: string | undefined;
  private calls: PaidCall[] = [];

  /**
   * Stops a call from starting once the ceiling is reached. The stop is kept as a failure too: the pipeline swallows the throw
   * and reads it as "no answer", so a request the ceiling cut short would otherwise look like a model that answered badly.
   */
  override handleChatModelStart(): void {
    try {
      this.ledger.assertRoom();
    } catch (error) {
      this.failure = error instanceof Error ? error.message : String(error);
      throw error;
    }
  }

  /**
   * The pipeline reads a call that errored as "the model gave no answer" and falls back, which in a report looks like a model
   * that draws badly. Keeping the error lets the run say the model was not reached.
   */
  override handleLLMError(error: unknown): void {
    this.failure = error instanceof Error ? error.message : String(error);
  }

  /** The error of the last call that failed, once, or `undefined` when none did since it was last asked. */
  takeFailure(): string | undefined {
    const failure = this.failure;
    this.failure = undefined;

    return failure;
  }

  /**
   * The calls that finished since it was last asked, once. A reply cut off at `maxTokens` is not an error, so without the stop
   * reason it would read as a model that wrote a bad answer.
   */
  takeCalls(): PaidCall[] {
    const calls = this.calls;
    this.calls = [];

    return calls;
  }

  override handleLLMEnd(output: LLMResult): void {
    const generation = output.generations[0]?.[0];
    const message = generation !== undefined && "message" in generation ? generation.message : undefined;
    if (!AIMessage.isInstance(message)) {
      return;
    }

    const inputTokens = message.usage_metadata?.input_tokens ?? 0;
    const outputTokens = message.usage_metadata?.output_tokens ?? 0;
    this.ledger.add(haikuCost({inputTokens, outputTokens}));
    this.calls.push({inputTokens, outputTokens, stopReason: this.stopReasonOf(message)});
  }

  private stopReasonOf(message: AIMessage): string | undefined {
    const stopReason: unknown = message.response_metadata.stop_reason;
    if (typeof stopReason === "string") {
      return stopReason;
    }

    return undefined;
  }
}
