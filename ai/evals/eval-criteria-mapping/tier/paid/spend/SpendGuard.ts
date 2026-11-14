import {BaseCallbackHandler} from "@langchain/core/callbacks/base";
import {AIMessage} from "@langchain/core/messages";
import type {LLMResult} from "@langchain/core/outputs";
import {haikuCost} from "@evals/eval-criteria-mapping/tier/paid/spend/HaikuCost";
import type {SpendLedger} from "@evals/eval-criteria-mapping/tier/paid/spend/SpendLedger";

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

  override handleChatModelStart(): void {
    this.ledger.assertRoom();
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

  override handleLLMEnd(output: LLMResult): void {
    const generation = output.generations[0]?.[0];
    const message = generation !== undefined && "message" in generation ? generation.message : undefined;
    if (!AIMessage.isInstance(message)) {
      return;
    }

    this.ledger.add(
      haikuCost({
        inputTokens: message.usage_metadata?.input_tokens ?? 0,
        outputTokens: message.usage_metadata?.output_tokens ?? 0,
      }),
    );
  }
}
