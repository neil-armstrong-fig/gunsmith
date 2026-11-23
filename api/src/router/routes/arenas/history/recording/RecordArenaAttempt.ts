import {keepGenerationAttempt} from "@src/accounts/keep-generation-attempt/KeepGenerationAttempt";
import {arenaAttemptOutcome} from "@src/router/routes/arenas/history/recording/outcome/ArenaAttemptOutcome";
import {clearedArenaPrompt} from "@src/router/routes/arenas/history/recording/prompt/ClearedArenaPrompt";
import type {CompletedArenaAttempt} from "@src/router/routes/arenas/history/recording/types/CompletedArenaAttempt";
import type {ArenaHistoryRequest} from "@src/router/routes/arenas/history/types/ArenaHistoryRequest";
import {hashSessionToken} from "@src/router/routes/shared/session/HashSessionToken";

export async function recordArenaAttempt(
  historyRequest: ArenaHistoryRequest,
  {reservation, outcome, response}: CompletedArenaAttempt,
): Promise<void> {
  const diagnostics = outcome.history;
  if (!diagnostics) return;

  try {
    const prompt = await clearedArenaPrompt(outcome, historyRequest.privacyCheck, reservation.prompt);
    await keepGenerationAttempt(
      {
        id: reservation.key,
        userId: reservation.accountId,
        kind: "arena",
        createdAt: historyRequest.createdAt,
        pipelineVersion: diagnostics.pipelineVersion,
        codeEdits: diagnostics.codeEdits,
        modelRepairs: diagnostics.modelRepairs,
        prompt,
        ...arenaAttemptOutcome(outcome.status, diagnostics, response),
      },
      await hashSessionToken(historyRequest.token),
      new Date(),
    );
  } catch {
    console.warn(JSON.stringify({route: "arenas", outcome: "generation-history-not-kept"}));
  }
}
