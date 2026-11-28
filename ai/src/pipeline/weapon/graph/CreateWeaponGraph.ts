import {END, START, StateGraph} from "@langchain/langgraph";
import type {WeaponPipelineDependencies} from "@gunsmith/ai/pipeline/weapon/types/WeaponPipelineDependencies";
import type {WeaponGraph} from "@gunsmith/ai/pipeline/weapon/graph/types/WeaponGraph";
import {balanceNode} from "@gunsmith/ai/pipeline/weapon/graph/checking/BalanceNode";
import {rateNode} from "@gunsmith/ai/pipeline/weapon/graph/checking/RateNode";
import {validateNode} from "@gunsmith/ai/pipeline/weapon/graph/checking/ValidateNode";
import {generateNode} from "@gunsmith/ai/pipeline/weapon/graph/drafting/GenerateNode";
import {repairNode} from "@gunsmith/ai/pipeline/weapon/graph/drafting/RepairNode";
import {appearanceNode} from "@gunsmith/ai/pipeline/weapon/graph/drawing/AppearanceNode";
import {continueUnlessRefused} from "@gunsmith/ai/pipeline/weapon/graph/routing/ContinueUnlessRefused";
import {continueUnlessRejected} from "@gunsmith/ai/pipeline/weapon/graph/routing/ContinueUnlessRejected";
import {moderationNode} from "@gunsmith/ai/pipeline/weapon/graph/screening/ModerationNode";
import {precheckNode} from "@gunsmith/ai/pipeline/weapon/graph/screening/PrecheckNode";
import {WeaponGraphState} from "@gunsmith/ai/pipeline/weapon/graph/state/WeaponGraphState";

/**
 * The weapon pipeline as a fixed LangGraph `StateGraph`: no node chooses its own tools or its own next step.
 * `precheck` and `moderation` screen the player's words; `generate` has the model write a weapon; `validate`, `balance` and `rate`
 * are code's checks; a refusal by either check goes to `repair` once and back to `validate`, and a second refusal ends the run
 * (an invalid request); a weapon that passes is drawn by `draw` (a node cannot share a name with a state field, and `appearance` is one). A turned-away request ends the run at the node that
 * turned it away. Model calls: moderation, generate and at most one repair, then the drawing and at most one repair, five at most.
 * The models are handed in and live in the nodes' closures, never in the state.
 */
export function createWeaponGraph(weaponPipelineDependencies: WeaponPipelineDependencies): WeaponGraph {
  return new StateGraph(WeaponGraphState)
    .addNode("precheck", precheckNode)
    .addNode("moderation", state => moderationNode(state, weaponPipelineDependencies.moderator))
    .addNode("generate", state => generateNode(state, weaponPipelineDependencies.generator))
    .addNode("validate", validateNode)
    .addNode("balance", balanceNode)
    .addNode("rate", rateNode)
    .addNode("repair", state => repairNode(state, weaponPipelineDependencies.generator))
    .addNode("draw", state => appearanceNode(state, weaponPipelineDependencies.appearanceGenerator))
    .addEdge(START, "precheck")
    .addConditionalEdges("precheck", continueUnlessRejected("moderation"), ["moderation", END])
    .addConditionalEdges("moderation", continueUnlessRejected("generate"), ["generate", END])
    .addEdge("generate", "validate")
    .addConditionalEdges("validate", continueUnlessRefused("balance"), ["balance", "repair", END])
    .addEdge("balance", "rate")
    .addConditionalEdges("rate", continueUnlessRefused("draw"), ["draw", "repair", END])
    .addEdge("repair", "validate")
    .addEdge("draw", END)
    .compile();
}
