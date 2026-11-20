import type {ArenaSubmission} from "@gunsmith/ai/pipeline/arena-submission/types/ArenaSubmission";
import type {ArenaSubmissionDependencies} from "@gunsmith/ai/pipeline/arena-submission/types/ArenaSubmissionDependencies";
import type {ArenaSubmissionScreening} from "@gunsmith/ai/pipeline/arena-submission/types/ArenaSubmissionScreening";
import {createArenaModels} from "@gunsmith/ai/adapter/CreateArenaModels";
import {BUILT_IN_ARENAS} from "@gunsmith/engine/built-in-arenas/BuiltInArenas";
import {paidModelOptions} from "@evals/eval-criteria-mapping/environment/tier/paid/PaidModelOptions";
import {runPaidRequest} from "@evals/eval-criteria-mapping/environment/tier/paid/run/RunPaidRequest";
import {paidSpendGuard} from "@evals/eval-criteria-mapping/environment/tier/paid/spend/PaidSpendGuard";
import {paidSpendLedger} from "@evals/eval-criteria-mapping/environment/tier/paid/spend/PaidSpendLedger";
import {ArenaSubmissionEvalDriver} from "@evals/eval-criteria-mapping/setups/arena-submission/shared/ArenaSubmissionEvalDriver";
import type {ArenaSubmissionRun} from "@evals/eval-criteria-mapping/setups/arena-submission/shared/types/ArenaSubmissionRun";

// What every paid screening cost in tokens and time, one JSON line each (`*-latest.jsonl` is git-ignored).
const PAID_CALL_LOG = "src/evals/results/paid-arena-submission-calls-latest.jsonl";

// The screening is plain code, not a graph, so its calls name no node; moderation is the only call it makes.
const SCREENING_STAGE = "moderation";

/** Arena-submission screening on Haiku: one trial because it costs money, every screening checked against the ledger and logged. */
export class PaidArenaSubmissionEvalDriver extends ArenaSubmissionEvalDriver {
  constructor(requestedTrials: string | undefined) {
    super(requestedTrials, 1);
  }

  protected createModels(): ArenaSubmissionDependencies {
    return {moderator: createArenaModels(paidModelOptions()).moderator, builtInArenas: BUILT_IN_ARENAS};
  }

  protected override runThrough(
    submissions: readonly ArenaSubmission[],
    screening: ArenaSubmissionRun,
  ): Promise<ArenaSubmissionScreening> {
    return runPaidRequest(this.describe(submissions), {
      run: () => screening(submissions),
      ledger: paidSpendLedger(),
      guard: paidSpendGuard(),
      logFile: PAID_CALL_LOG,
      subject: "the screening",
      defaultStage: SCREENING_STAGE,
    });
  }

  // What the log line names the request by: each player's words, or the built-in arena they named.
  private describe(submissions: readonly ArenaSubmission[]): string {
    return submissions.map(submission => this.describeOne(submission)).join(" | ");
  }

  private describeOne(submission: ArenaSubmission): string {
    if (submission.kind === "prompt") {
      return `${submission.playerId}: ${submission.prompt}`;
    }

    return `${submission.playerId}: built-in ${submission.builtInName}`;
  }
}
