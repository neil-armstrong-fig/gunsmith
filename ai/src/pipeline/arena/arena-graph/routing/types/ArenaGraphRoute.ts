import type {ArenaGraphStateValues} from "@gunsmith/ai/pipeline/arena/arena-graph/state/types/ArenaGraphStateValues";

/** Decides, from the state, which node runs next (or the end of the run): the function behind a conditional edge. */
export type ArenaGraphRoute = (state: ArenaGraphStateValues) => string;
