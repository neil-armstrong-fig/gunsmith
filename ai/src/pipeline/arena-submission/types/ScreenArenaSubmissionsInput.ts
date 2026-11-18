import type {ArenaSubmission} from "@gunsmith/ai/pipeline/arena-submission/types/ArenaSubmission";

/** What the players put forward: none, one or two submissions (a match has two players), in the order they arrived. */
export interface ScreenArenaSubmissionsInput {
  submissions: readonly ArenaSubmission[];
}
