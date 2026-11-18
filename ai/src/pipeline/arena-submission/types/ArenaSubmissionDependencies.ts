import type {BaseChatModel} from "@langchain/core/language_models/chat_models";
import type {ArenaDrawing} from "@gunsmith/ai/pipeline/arena/types/ArenaDrawing";

/**
 * What screening is handed and never builds: the cheap model that says whether each prompt is a request for an arena at all (the
 * arena pipeline's own moderation), and the built-in arenas a player may name instead of describing one. Tests and evals pass a fake or
 * a local model; the Worker passes the real one.
 */
export interface ArenaSubmissionDependencies {
  moderator: BaseChatModel;
  /** The arenas a built-in submission may name. The same list the arena pipeline falls back to. */
  builtInArenas: readonly ArenaDrawing[];
}
