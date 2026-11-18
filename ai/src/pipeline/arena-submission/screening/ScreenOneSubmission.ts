import {arenaModerationJudge} from "@gunsmith/ai/pipeline/arena/prompt-screening/moderation/ArenaModerationJudge";
import {precheckArenaPrompt} from "@gunsmith/ai/pipeline/arena/prompt-screening/precheck/PrecheckArenaPrompt";
import type {ScreenedSubmission} from "@gunsmith/ai/pipeline/arena-submission/screening/types/ScreenedSubmission";
import type {ArenaSubmission} from "@gunsmith/ai/pipeline/arena-submission/types/ArenaSubmission";
import type {BuiltInSubmission} from "@gunsmith/ai/pipeline/arena-submission/types/BuiltInSubmission";
import type {ArenaSubmissionDependencies} from "@gunsmith/ai/pipeline/arena-submission/types/ArenaSubmissionDependencies";

/**
 * Puts one submission through the arena pipeline's own screen, so a prompt that could not be generated is never put to the players:
 * the arena pre-check first, which costs no model call, then the moderation judge, one call. A built-in submission needs no model:
 * it passes if we have an arena of that name. The reason of a refusal is the screen's own words, never the player's.
 */
export async function screenOneSubmission(
  submission: ArenaSubmission,
  dependencies: ArenaSubmissionDependencies,
): Promise<ScreenedSubmission> {
  if (submission.kind === "built-in") {
    return screenBuiltIn(submission, dependencies);
  }

  const precheck = precheckArenaPrompt(submission.prompt);
  if (!precheck.accepted) {
    return {rejected: {playerId: submission.playerId, reason: precheck.reason}, modelCalls: 0};
  }

  const verdict = await arenaModerationJudge(submission.prompt, dependencies.moderator);
  if (!verdict.isArenaRequest) {
    return {rejected: {playerId: submission.playerId, reason: verdict.reason}, modelCalls: 1};
  }

  return {passed: submission, modelCalls: 1};
}

function screenBuiltIn(submission: BuiltInSubmission, dependencies: ArenaSubmissionDependencies): ScreenedSubmission {
  if (!dependencies.builtInArenas.some(arena => arena.name === submission.builtInName)) {
    return {
      rejected: {playerId: submission.playerId, reason: "That is not one of our built-in arenas."},
      modelCalls: 0,
    };
  }

  return {passed: submission, modelCalls: 0};
}
