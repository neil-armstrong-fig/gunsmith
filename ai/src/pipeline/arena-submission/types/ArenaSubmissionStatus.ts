/**
 * What screening leaves for the players: nothing (no submission survived, so a built-in arena is used), one submission (it goes
 * forward by default), or two (both are generated and the players pick between them).
 */
export const arenaSubmissionStatuses = ["none", "only-submission", "players-pick"] as const;

export type ArenaSubmissionStatus = (typeof arenaSubmissionStatuses)[number];
