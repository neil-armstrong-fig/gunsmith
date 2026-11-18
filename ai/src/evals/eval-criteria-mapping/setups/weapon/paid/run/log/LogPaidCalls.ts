import {appendFileSync, mkdirSync} from "node:fs";
import {dirname} from "node:path";
import type {PaidCallLogOptions} from "@evals/eval-criteria-mapping/setups/weapon/paid/run/log/types/PaidCallLogOptions";

/**
 * Adds one line to the paid call log: what a weapon request cost in tokens, how each call stopped and how long it took, and how
 * many of the calls were the stats stage's, so the cost of the stats and of the drawing can be told apart. It is
 * the measured input `docs/cost-and-budget.md` was waiting for, and what tells a cut-off answer from a bad one afterwards.
 */
export function logPaidCalls(options: PaidCallLogOptions): void {
  mkdirSync(dirname(options.file), {recursive: true});

  const entry = {
    at: new Date().toISOString(),
    prompt: options.prompt,
    durationMs: options.durationMs,
    statsCalls: options.statsCalls,
    calls: options.calls,
  };
  appendFileSync(options.file, `${JSON.stringify(entry)}\n`);
}
