import type {ArenaSubmission} from "@gunsmith/ai/pipeline/arena-submission/types/ArenaSubmission";
import type {ArenaSubmissionStatus} from "@gunsmith/ai/pipeline/arena-submission/types/ArenaSubmissionStatus";
import type {RejectedSubmission} from "@gunsmith/ai/pipeline/arena-submission/types/RejectedSubmission";

/**
 * The result of screening the arena submissions. DRAFT, local to `ai/` until server and the adapter owner freeze the real contract in
 * `HANDOFF.md`. The caller generates each surviving prompt with `generateArena`; nothing here chooses between them.
 */
export interface ArenaSubmissionScreening {
  status: ArenaSubmissionStatus;
  /** The submissions that passed, word for word, in the order they arrived: none, one or two. */
  survivors: readonly ArenaSubmission[];
  /** The submissions turned away, with why. */
  rejected: readonly RejectedSubmission[];
  /** Model calls made: one moderation for each prompt that passed the pre-check, none for a built-in. Two at most. */
  modelCalls: number;
}
