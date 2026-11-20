import {logPaidCalls} from "@evals/eval-criteria-mapping/environment/tier/paid/run/log/LogPaidCalls";
import type {PaidRequestOptions} from "@evals/eval-criteria-mapping/environment/tier/paid/run/types/PaidRequestOptions";
import type {PaidCall} from "@evals/eval-criteria-mapping/environment/tier/paid/spend/types/PaidCall";

const CUT_OFF_REASON = "max_tokens";

/**
 * Puts one request through its pipeline on the paid models and makes sure the result means what it says. A pipeline reads a
 * failed call, or an answer cut off at the token limit, as "the model wrote nothing usable", which in a report looks like a
 * model that over-rejects or writes bad answers. So the run fails in words instead, and the request's calls are logged either way.
 */
export async function runPaidRequest<Outcome>(prompt: string, options: PaidRequestOptions<Outcome>): Promise<Outcome> {
  options.ledger.assertRoom();

  const started = Date.now();
  const outcome = await options.run();
  const calls = staged(options.guard.takeCalls(), options.defaultStage);
  logPaidCalls({file: options.logFile, prompt, durationMs: Date.now() - started, calls});

  const failure = options.guard.takeFailure();
  if (failure !== undefined) {
    throw new Error(`A paid model call failed, so this result says nothing about ${options.subject}: ${failure}`);
  }

  if (calls.some(call => call.stopReason === CUT_OFF_REASON)) {
    throw new Error(
      `A paid model answer was cut off at its token limit, so this result says nothing about ${options.subject}: raise that model's maxTokens.`,
    );
  }

  return outcome;
}

function staged(calls: PaidCall[], defaultStage: string | undefined): PaidCall[] {
  return calls.map(call => ({...call, stage: call.stage ?? defaultStage}));
}
