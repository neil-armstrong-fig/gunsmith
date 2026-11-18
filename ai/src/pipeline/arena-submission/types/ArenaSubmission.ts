import type {BuiltInSubmission} from "@gunsmith/ai/pipeline/arena-submission/types/BuiltInSubmission";
import type {PromptSubmission} from "@gunsmith/ai/pipeline/arena-submission/types/PromptSubmission";

/** What a player puts forward as the arena: their own words, or a built-in arena. */
export type ArenaSubmission = PromptSubmission | BuiltInSubmission;
