import {BaseCallbackHandler} from "@langchain/core/callbacks/base";
import {AIMessage} from "@langchain/core/messages";
import type {LLMResult} from "@langchain/core/outputs";
import {haikuCost} from "@evals/eval-criteria-mapping/environment/tier/paid/spend/HaikuCost";
import type {SpendLedger} from "@evals/eval-criteria-mapping/environment/tier/paid/spend/SpendLedger";
import type {ChatModelStartArguments} from "@evals/eval-criteria-mapping/environment/tier/paid/spend/types/ChatModelStartArguments";
import type {PaidCall} from "@evals/eval-criteria-mapping/environment/tier/paid/spend/types/PaidCall";
import type {PendingCall} from "@evals/eval-criteria-mapping/environment/tier/paid/spend/types/PendingCall";

/**
 * The paid tier's spend guard: it counts every call into the ledger from the tokens the model reports, and stops a call from
 * starting once the ceiling is reached. `raiseError` is what makes LangChain pass the stop on instead of logging it.
 */
export class SpendGuard extends BaseCallbackHandler {
  name = "SpendGuard";
  override raiseError = true;

  constructor(
    private readonly ledger: SpendLedger,
    private readonly now: () => number = Date.now,
  ) {
    super();
  }

  private failure: string | undefined;
  private calls: PaidCall[] = [];
  // Calls may run together, so each is kept under its own run id.
  private readonly started = new Map<string, PendingCall>();

  /**
   * Stops a call from starting once the ceiling is reached. The stop is kept as a failure too: the pipeline swallows the throw
   * and reads it as "no answer", so a request the ceiling cut short would otherwise look like a model that answered badly.
   */
  // LangChain hands over eight arguments, and the lint rule allows three, so they are taken as one list: the run id is the third and
  // the metadata, where LangGraph names the node, the seventh.
  override handleChatModelStart(...started: ChatModelStartArguments): void {
    const [, , runId, , , , metadata] = started;

    try {
      this.ledger.assertRoom();
    } catch (error) {
      this.failure = error instanceof Error ? error.message : String(error);
      throw error;
    }

    this.started.set(runId, {startedAt: this.now(), stage: this.stageOf(metadata)});
  }

  /**
   * The pipeline reads a call that errored as "the model gave no answer" and falls back, which in a report looks like a model
   * that draws badly. Keeping the error lets the run say the model was not reached.
   */
  override handleLLMError(error: unknown, runId: string): void {
    this.failure = error instanceof Error ? error.message : String(error);
    this.started.delete(runId);
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

  override handleLLMEnd(output: LLMResult, runId: string): void {
    const generation = output.generations[0]?.[0];
    const message = generation !== undefined && "message" in generation ? generation.message : undefined;
    if (!AIMessage.isInstance(message)) {
      return;
    }

    const inputTokens = message.usage_metadata?.input_tokens ?? 0;
    const outputTokens = message.usage_metadata?.output_tokens ?? 0;
    this.ledger.add(haikuCost({inputTokens, outputTokens}));
    const started = this.started.get(runId);
    this.started.delete(runId);
    this.calls.push({
      inputTokens,
      outputTokens,
      stopReason: this.stopReasonOf(message),
      stage: started?.stage,
      latencyMs: this.latencyOf(started),
    });
  }

  // LangGraph names the node a call runs in; a call made outside a graph carries none.
  private stageOf(metadata: Record<string, unknown> | undefined): string | undefined {
    const node = metadata?.langgraph_node;
    if (typeof node === "string") {
      return node;
    }

    return undefined;
  }

  private latencyOf(started: PendingCall | undefined): number | undefined {
    if (started === undefined) {
      return undefined;
    }

    return this.now() - started.startedAt;
  }

  private stopReasonOf(message: AIMessage): string | undefined {
    const stopReason: unknown = message.response_metadata.stop_reason;
    if (typeof stopReason === "string") {
      return stopReason;
    }

    return undefined;
  }
}
