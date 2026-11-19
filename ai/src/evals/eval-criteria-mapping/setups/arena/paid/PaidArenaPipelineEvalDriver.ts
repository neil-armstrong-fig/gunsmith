import type {ArenaOutcome} from "@gunsmith/ai/pipeline/arena/types/ArenaOutcome";
import type {ArenaPipelineDependencies} from "@gunsmith/ai/pipeline/arena/types/ArenaPipelineDependencies";
import {parseArenaFormat} from "@gunsmith/ai/pipeline/arena/arena-drafting/format/ParseArenaFormat";
import {BUILT_IN_ARENAS} from "@gunsmith/engine/built-in-arenas/BuiltInArenas";
import {runPaidRequest} from "@evals/eval-criteria-mapping/environment/tier/paid/run/RunPaidRequest";
import {paidSpendGuard} from "@evals/eval-criteria-mapping/environment/tier/paid/spend/PaidSpendGuard";
import {paidSpendLedger} from "@evals/eval-criteria-mapping/environment/tier/paid/spend/PaidSpendLedger";
import {createPaidArenaModels} from "@evals/eval-criteria-mapping/setups/arena/paid/models/PaidArenaModels";
import {ArenaPipelineEvalDriver} from "@evals/eval-criteria-mapping/setups/arena/shared/ArenaPipelineEvalDriver";
import type {ArenaPipelineRun} from "@evals/eval-criteria-mapping/setups/arena/shared/types/ArenaPipelineRun";

// What every paid arena request cost in tokens and time, one JSON line each (`*-latest.jsonl` is git-ignored).
const PAID_CALL_LOG = "src/evals/results/paid-arena-calls-latest.jsonl";

/** The arena pipeline on Haiku: one trial because it costs money, every request checked against the ledger and logged. */
export class PaidArenaPipelineEvalDriver extends ArenaPipelineEvalDriver {
  constructor(requestedTrials: string | undefined) {
    super({tier: "paid", requestedTrials, defaultTrials: 1, keepsGeneratedByDefault: false});
  }

  // `EVAL_ARENA_FORMAT=shapes` has the model describe the arena as shapes instead of rows, as the local tier does.
  protected createModels(): ArenaPipelineDependencies {
    return {
      ...createPaidArenaModels(),
      format: parseArenaFormat(process.env.EVAL_ARENA_FORMAT),
      builtInArenas: BUILT_IN_ARENAS,
    };
  }

  protected override runThrough(prompt: string, pipeline: ArenaPipelineRun): Promise<ArenaOutcome> {
    return runPaidRequest(prompt, {
      run: () => pipeline(prompt),
      ledger: paidSpendLedger(),
      guard: paidSpendGuard(),
      logFile: PAID_CALL_LOG,
      subject: "the arena",
    });
  }
}
