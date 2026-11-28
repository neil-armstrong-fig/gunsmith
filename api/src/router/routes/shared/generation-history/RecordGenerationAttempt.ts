import {keepGenerationAttempt} from "@src/shared/accounts/keep-generation-attempt/KeepGenerationAttempt";
import type {GenerationAttempt} from "@src/shared/accounts/types/GenerationAttempt";
import type {AttemptOutcome} from "@src/router/routes/shared/generation-history/types/AttemptOutcome";
import type {CompletedGenerationAttempt} from "@src/router/routes/shared/generation-history/types/CompletedGenerationAttempt";
import type {GenerationHistoryRequest} from "@src/router/routes/shared/generation-history/types/GenerationHistoryRequest";
import type {InterruptedGenerationAttempt} from "@src/router/routes/shared/generation-history/types/InterruptedGenerationAttempt";
import {hashSessionToken} from "@src/router/routes/shared/session/HashSessionToken";

const INTERRUPTED_OUTCOMES = {
  "ai-unavailable": {outcome: "blocked", failureStage: "availability", failureReason: "ai-unavailable"},
  "ai-off": {outcome: "blocked", failureStage: "spend", failureReason: "ai-off"},
  "no-credits": {outcome: "blocked", failureStage: "credit", failureReason: "no-credits"},
  "spend-cap": {outcome: "blocked", failureStage: "spend", failureReason: "spend-cap"},
  "generation-timed-out": {outcome: "failed", failureStage: "pipeline", failureReason: "generation-timed-out"},
  "generation-failed": {outcome: "failed", failureStage: "pipeline", failureReason: "generation-failed"},
} satisfies Record<InterruptedGenerationAttempt["reason"], AttemptOutcome>;

export async function recordGenerationAttempt(
  historyRequest: GenerationHistoryRequest,
  result: CompletedGenerationAttempt | InterruptedGenerationAttempt,
): Promise<void> {
  try {
    const attempt = await attemptOf(historyRequest, result);
    await keepGenerationAttempt(attempt, await hashSessionToken(historyRequest.token), new Date());
  } catch {
    console.warn(JSON.stringify({route: `${historyRequest.kind}s`, outcome: "generation-history-not-kept"}));
  }
}

async function attemptOf(
  historyRequest: GenerationHistoryRequest,
  result: CompletedGenerationAttempt | InterruptedGenerationAttempt,
): Promise<GenerationAttempt> {
  const {kind, createdAt, pipelineVersion} = historyRequest;
  if ("reason" in result) {
    return {
      id: result.key,
      userId: result.accountId,
      kind,
      createdAt,
      pipelineVersion,
      codeEdits: 0,
      modelRepairs: 0,
      ...INTERRUPTED_OUTCOMES[result.reason],
    };
  }

  const {reservation, diagnostics, classification} = result;

  return {
    id: reservation.key,
    userId: reservation.accountId,
    kind,
    createdAt,
    pipelineVersion: diagnostics.pipelineVersion,
    codeEdits: diagnostics.codeEdits,
    modelRepairs: diagnostics.modelRepairs,
    prompt: redactedPrompt(historyRequest, result),
    ...classification,
  };
}

/**
 * Every completed attempt keeps its prompt redacted, rejected and off-topic ones included, because those are what tune moderation (the
 * user, 2026-11-26). The judge's own words are never kept, and a redaction that throws keeps no text.
 */
function redactedPrompt(
  {redaction}: GenerationHistoryRequest,
  {reservation: {prompt}}: CompletedGenerationAttempt,
): string | undefined {
  try {
    return redaction(prompt);
  } catch {
    return undefined;
  }
}
