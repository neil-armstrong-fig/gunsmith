import type {ArenaGraphState} from "@gunsmith/ai/pipeline/arena/graph/state/ArenaGraphState";

/** What a node hands back: only the fields it changes. */
export type ArenaGraphUpdate = typeof ArenaGraphState.Update;
