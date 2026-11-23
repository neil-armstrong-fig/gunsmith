import {ARENA_PIPELINE_VERSION} from "@gunsmith/ai/pipeline/arena/history/ArenaPipelineVersion";
import {keepGenerationAttempt} from "@src/accounts/keep-generation-attempt/KeepGenerationAttempt";
import type {GenerationAttempt} from "@src/accounts/types/GenerationAttempt";
import {arenaAttemptOutcome} from "@src/router/routes/arenas/history/recording/outcome/ArenaAttemptOutcome";
import {clearedArenaPrompt} from "@src/router/routes/arenas/history/recording/prompt/ClearedArenaPrompt";
import type {AttemptOutcome} from "@src/router/routes/arenas/history/recording/types/AttemptOutcome";
import type {CompletedArenaAttempt} from "@src/router/routes/arenas/history/recording/types/CompletedArenaAttempt";
import type {InterruptedArenaAttempt} from "@src/router/routes/arenas/history/recording/types/InterruptedArenaAttempt";
import type {ArenaHistoryRequest} from "@src/router/routes/arenas/history/types/ArenaHistoryRequest";
import {hashSessionToken} from "@src/router/routes/shared/session/HashSessionToken";

const INTERRUPTED_OUTCOMES = {
  "ai-unavailable": {outcome: "blocked", failureStage: "availability", failureReason: "ai-unavailable"},
  "ai-off": {outcome: "blocked", failureStage: "spend", failureReason: "ai-off"},
  "no-credits": {outcome: "blocked", failureStage: "credit", failureReason: "no-credits"},
  "spend-cap": {outcome: "blocked", failureStage: "spend", failureReason: "spend-cap"},
  "generation-timed-out": {outcome: "failed", failureStage: "pipeline", failureReason: "generation-timed-out"},
  "generation-failed": {outcome: "failed", failureStage: "pipeline", failureReason: "generation-failed"},
} satisfies Record<InterruptedArenaAttempt["reason"], AttemptOutcome>;

export async function recordArenaAttempt(
  historyRequest: ArenaHistoryRequest,
  result: CompletedArenaAttempt | InterruptedArenaAttempt,
): Promise<void> {
  try {
    const attempt = await attemptOf(historyRequest, result);
    if (!attempt) return;

    await keepGenerationAttempt(attempt, await hashSessionToken(historyRequest.token), new Date());
  } catch {
    console.warn(JSON.stringify({route: "arenas", outcome: "generation-history-not-kept"}));
  }
}

async function attemptOf(
  {createdAt, privacyCheck}: ArenaHistoryRequest,
  result: CompletedArenaAttempt | InterruptedArenaAttempt,
): Promise<GenerationAttempt | undefined> {
  if ("reason" in result) {
    return {
      id: result.key,
      userId: result.accountId,
      kind: "arena",
      createdAt,
      pipelineVersion: ARENA_PIPELINE_VERSION,
      codeEdits: 0,
      modelRepairs: 0,
      ...INTERRUPTED_OUTCOMES[result.reason],
    };
  }

  const {reservation, outcome, response} = result;
  const diagnostics = outcome.history;
  if (!diagnostics) return undefined;

  return {
    id: reservation.key,
    userId: reservation.accountId,
    kind: "arena",
    createdAt,
    pipelineVersion: diagnostics.pipelineVersion,
    codeEdits: diagnostics.codeEdits,
    modelRepairs: diagnostics.modelRepairs,
    prompt: await clearedArenaPrompt(outcome, privacyCheck, reservation.prompt),
    ...arenaAttemptOutcome(outcome.status, diagnostics, response),
  };
}
