import type {ArenaSubmission} from "@gunsmith/ai/pipeline/arena-submission/types/ArenaSubmission";
import type {RejectedSubmission} from "@gunsmith/ai/pipeline/arena-submission/types/RejectedSubmission";

/** How one submission fared in the screen: it passed, or it was turned away; and whether a model was called to say so. */
export interface ScreenedSubmission {
  passed?: ArenaSubmission;
  rejected?: RejectedSubmission;
  /** One when the moderator was asked, none when the pre-check turned a prompt away first or the submission was a built-in. */
  modelCalls: number;
}
