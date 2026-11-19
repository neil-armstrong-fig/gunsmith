import {screenOneSubmission} from "@gunsmith/ai/pipeline/arena-submission/screening/ScreenOneSubmission";
import type {ArenaSubmission} from "@gunsmith/ai/pipeline/arena-submission/types/ArenaSubmission";
import type {ArenaSubmissionDependencies} from "@gunsmith/ai/pipeline/arena-submission/types/ArenaSubmissionDependencies";
import type {ArenaSubmissionScreening} from "@gunsmith/ai/pipeline/arena-submission/types/ArenaSubmissionScreening";
import type {ArenaSubmissionStatus} from "@gunsmith/ai/pipeline/arena-submission/types/ArenaSubmissionStatus";
import type {ScreenArenaSubmissionsInput} from "@gunsmith/ai/pipeline/arena-submission/types/ScreenArenaSubmissionsInput";

const MOST_SUBMISSIONS = 2;

/**
 * Screens the arenas two players put forward, so only ones that can be played reach them. Each prompt goes through the arena pipeline's
 * own pre-check and moderation (a built-in arena needs only to exist), and what is left decides what happens next: nothing (a
 * built-in arena is used), one submission (it goes forward by default), or two (both are generated with `generateArena`, and the
 * players pick between them with engine's `resolveArenaPicks`). Nothing here chooses an arena: the players do. Model calls: one moderation for
 * each prompt, two at most.
 */
export async function screenArenaSubmissions(
  input: ScreenArenaSubmissionsInput,
  dependencies: ArenaSubmissionDependencies,
): Promise<ArenaSubmissionScreening> {
  requireAMatchsSubmissions(input.submissions);

  const screened = await Promise.all(
    input.submissions.map(submission => screenOneSubmission(submission, dependencies)),
  );
  const survivors = screened.flatMap(({passed}) => passed ?? []);

  return {
    status: statusFor(survivors),
    survivors,
    rejected: screened.flatMap(({rejected}) => rejected ?? []),
    modelCalls: screened.reduce((total, {modelCalls}) => total + modelCalls, 0),
  };
}

function statusFor(survivors: readonly ArenaSubmission[]): ArenaSubmissionStatus {
  if (survivors.length === 0) {
    return "none";
  }

  if (survivors.length === 1) {
    return "only-submission";
  }

  return "players-pick";
}

function requireAMatchsSubmissions(submissions: readonly ArenaSubmission[]): void {
  if (submissions.length > MOST_SUBMISSIONS) {
    throw new Error(`An arena is picked from at most two submissions, but ${submissions.length} were made.`);
  }

  const playerIds = submissions.map(submission => submission.playerId);
  if (new Set(playerIds).size !== playerIds.length) {
    throw new Error("An arena is picked from one submission for each player, but a player made two.");
  }
}
