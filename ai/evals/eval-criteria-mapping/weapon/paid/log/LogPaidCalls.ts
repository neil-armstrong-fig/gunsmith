import {appendFileSync, mkdirSync} from "node:fs";
import {dirname} from "node:path";
import type {PaidCallLogOptions} from "@evals/eval-criteria-mapping/weapon/paid/log/types/PaidCallLogOptions";

/**
 * Adds one line to the paid call log: what a weapon request cost in tokens, how each call stopped and how long it took. It is
 * the measured input `docs/cost-and-budget.md` was waiting for, and what tells a cut-off answer from a bad one afterwards.
 */
export function logPaidCalls(options: PaidCallLogOptions): void {
  mkdirSync(dirname(options.file), {recursive: true});

  const entry = {
    at: new Date().toISOString(),
    prompt: options.prompt,
    durationMs: options.durationMs,
    calls: options.calls,
  };
  appendFileSync(options.file, `${JSON.stringify(entry)}\n`);
}
