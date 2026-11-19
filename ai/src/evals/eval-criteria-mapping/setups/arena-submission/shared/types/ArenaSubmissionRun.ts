import type {ArenaSubmission} from "@gunsmith/ai/pipeline/arena-submission/types/ArenaSubmission";
import type {ArenaSubmissionScreening} from "@gunsmith/ai/pipeline/arena-submission/types/ArenaSubmissionScreening";

/** Puts the submissions through the real screening on the models its driver built. */
export type ArenaSubmissionRun = (submissions: readonly ArenaSubmission[]) => Promise<ArenaSubmissionScreening>;
