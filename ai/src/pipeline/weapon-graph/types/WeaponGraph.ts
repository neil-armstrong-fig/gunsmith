import type {CompiledStateGraph} from "@langchain/langgraph";
import type {
  WeaponGraphState,
  WeaponGraphStateValues,
  WeaponGraphUpdate,
} from "@gunsmith/ai/pipeline/weapon-graph/state/WeaponGraphState";

/** The compiled weapon graph: run it with `invoke({prompt})` and read the state it ended in; `getGraph()` draws its nodes and edges. */
export type WeaponGraph = CompiledStateGraph<
  WeaponGraphStateValues,
  WeaponGraphUpdate,
  string,
  typeof WeaponGraphState.spec,
  typeof WeaponGraphState.spec
>;
