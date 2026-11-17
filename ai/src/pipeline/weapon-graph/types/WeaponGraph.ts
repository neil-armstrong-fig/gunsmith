import type {CompiledStateGraph} from "@langchain/langgraph";
import type {WeaponGraphState} from "@gunsmith/ai/pipeline/weapon-graph/state/WeaponGraphState";
import type {WeaponGraphStateValues} from "@gunsmith/ai/pipeline/weapon-graph/state/types/WeaponGraphStateValues";
import type {WeaponGraphUpdate} from "@gunsmith/ai/pipeline/weapon-graph/state/types/WeaponGraphUpdate";

/** The compiled weapon graph: run it with `invoke({prompt})` and read the state it ended in; `getGraph()` draws its nodes and edges. */
export type WeaponGraph = CompiledStateGraph<
  WeaponGraphStateValues,
  WeaponGraphUpdate,
  string,
  typeof WeaponGraphState.spec,
  typeof WeaponGraphState.spec
>;
