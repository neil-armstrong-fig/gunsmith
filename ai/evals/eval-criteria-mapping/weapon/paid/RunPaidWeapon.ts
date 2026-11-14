import {logPaidCalls} from "@evals/eval-criteria-mapping/weapon/paid/log/LogPaidCalls";
import type {PaidWeaponRunOptions} from "@evals/eval-criteria-mapping/weapon/paid/types/PaidWeaponRunOptions";
import type {WeaponOutcome} from "@gunsmith/ai/pipeline/types/WeaponOutcome";

const CUT_OFF_REASON = "max_tokens";

/**
 * Puts one weapon request through the pipeline on the paid models and makes sure the result means what it says. The pipeline reads
 * a failed call, or an answer cut off at the token limit, as "the model wrote nothing usable", which in a report looks like a
 * model that over-rejects or writes bad weapons. So the run fails in words instead, and the request's calls are logged either way.
 */
export async function runPaidWeapon(prompt: string, options: PaidWeaponRunOptions): Promise<WeaponOutcome> {
  options.ledger.assertRoom();

  const started = Date.now();
  const outcome = await options.pipeline(prompt);
  const calls = options.guard.takeCalls();
  logPaidCalls({file: options.logFile, prompt, durationMs: Date.now() - started, calls});

  const failure = options.guard.takeFailure();
  if (failure !== undefined) {
    throw new Error(`A paid model call failed, so this result says nothing about the weapon: ${failure}`);
  }

  if (calls.some(call => call.stopReason === CUT_OFF_REASON)) {
    throw new Error(
      "A paid model answer was cut off at its token limit, so this result says nothing about the weapon: raise that model's maxTokens.",
    );
  }

  return outcome;
}
