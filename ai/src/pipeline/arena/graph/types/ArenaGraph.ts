import type {CompiledStateGraph} from "@langchain/langgraph";
import type {ArenaGraphState} from "@gunsmith/ai/pipeline/arena/graph/state/ArenaGraphState";
import type {ArenaGraphStateValues} from "@gunsmith/ai/pipeline/arena/graph/state/types/ArenaGraphStateValues";
import type {ArenaGraphUpdate} from "@gunsmith/ai/pipeline/arena/graph/state/types/ArenaGraphUpdate";

/** The compiled arena graph: run it with `invoke({prompt})` and read the state it ended in; `getGraph()` draws its nodes and edges. */
export type ArenaGraph = CompiledStateGraph<
  ArenaGraphStateValues,
  ArenaGraphUpdate,
  string,
  typeof ArenaGraphState.spec,
  typeof ArenaGraphState.spec
>;
