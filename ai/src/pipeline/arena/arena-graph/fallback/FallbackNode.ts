import {builtInArenaFor} from "@gunsmith/ai/pipeline/arena/arena-graph/fallback/choice/BuiltInArenaFor";
import type {ArenaGraphStateValues} from "@gunsmith/ai/pipeline/arena/arena-graph/state/types/ArenaGraphStateValues";
import type {ArenaGraphUpdate} from "@gunsmith/ai/pipeline/arena/arena-graph/state/types/ArenaGraphUpdate";
import type {ArenaDrawing} from "@gunsmith/ai/pipeline/arena/types/ArenaDrawing";

/** The last node of a request whose arena could not be used even after the one repair: gives a built-in arena, no model call. */
export function fallbackNode(state: ArenaGraphStateValues, builtInArenas: readonly ArenaDrawing[]): ArenaGraphUpdate {
  return {builtIn: builtInArenaFor(state.prompt, builtInArenas), nodes: ["fallback"]};
}
