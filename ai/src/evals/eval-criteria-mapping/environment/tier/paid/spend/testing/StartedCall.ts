import type {SpendGuard} from "@evals/eval-criteria-mapping/environment/tier/paid/spend/SpendGuard";

/** What LangChain does when a chat call starts: tells the guard the run's id and, inside a LangGraph node, the node's name. Test-only. */
export function startedCall(guard: SpendGuard, runId: string, node?: string): void {
  guard.handleChatModelStart({lc: 1, type: "not_implemented", id: []}, [], runId, undefined, undefined, undefined, {
    langgraph_node: node,
  });
}
