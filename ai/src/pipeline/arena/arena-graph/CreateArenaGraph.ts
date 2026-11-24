import {END, START, StateGraph} from "@langchain/langgraph";
import type {ArenaPipelineDependencies} from "@gunsmith/ai/pipeline/arena/types/ArenaPipelineDependencies";
import {DEFAULT_ARENA_FORMAT} from "@gunsmith/ai/pipeline/arena/arena-drafting/format/DefaultArenaFormat";
import {validateNode} from "@gunsmith/ai/pipeline/arena/arena-graph/checking/ValidateNode";
import {generateNode} from "@gunsmith/ai/pipeline/arena/arena-graph/drafting/GenerateNode";
import {repairNode} from "@gunsmith/ai/pipeline/arena/arena-graph/drafting/RepairNode";
import {fallbackNode} from "@gunsmith/ai/pipeline/arena/arena-graph/fallback/FallbackNode";
import {continueUnlessRejected} from "@gunsmith/ai/pipeline/arena/arena-graph/routing/ContinueUnlessRejected";
import {routeAfterValidate} from "@gunsmith/ai/pipeline/arena/arena-graph/routing/RouteAfterValidate";
import {moderationNode} from "@gunsmith/ai/pipeline/arena/arena-graph/screening/ModerationNode";
import {precheckNode} from "@gunsmith/ai/pipeline/arena/arena-graph/screening/PrecheckNode";
import {ArenaGraphState} from "@gunsmith/ai/pipeline/arena/arena-graph/state/ArenaGraphState";
import type {ArenaGraph} from "@gunsmith/ai/pipeline/arena/arena-graph/types/ArenaGraph";

/**
 * The arena pipeline as a fixed LangGraph `StateGraph`: no node chooses its own tools or its own next step.
 * `precheck` and `moderation` screen the player's words; `generate` has the model draw an arena; `validate` is code's check; a
 * refusal goes to `repair` once and back to `validate`, and a second refusal goes to `fallback`, which gives a built-in arena (a
 * request that was asked for properly always ends with an arena, and its credit is not refunded, because the model was used). A turned-away
 * request ends the run at the node that turned it away, and is refunded only if it was turned away before any model call. Model calls: moderation, generate and at most one repair, three at most.
 * The models and the built-in arenas are handed in and live in the nodes' closures, never in the state.
 */
export function createArenaGraph(arenaPipelineDependencies: ArenaPipelineDependencies): ArenaGraph {
  const format = arenaPipelineDependencies.format ?? DEFAULT_ARENA_FORMAT;

  return new StateGraph(ArenaGraphState)
    .addNode("precheck", precheckNode)
    .addNode("moderation", state => moderationNode(state, arenaPipelineDependencies.moderator))
    .addNode("generate", state => generateNode(state, arenaPipelineDependencies.generator, format))
    .addNode("validate", state => validateNode(state, format))
    .addNode("repair", state => repairNode(state, arenaPipelineDependencies.generator, format))
    .addNode("fallback", state => fallbackNode(state, arenaPipelineDependencies.builtInArenas))
    .addEdge(START, "precheck")
    .addConditionalEdges("precheck", continueUnlessRejected("moderation"), ["moderation", END])
    .addConditionalEdges("moderation", continueUnlessRejected("generate"), ["generate", END])
    .addEdge("generate", "validate")
    .addConditionalEdges("validate", routeAfterValidate, ["repair", "fallback", END])
    .addEdge("repair", "validate")
    .addEdge("fallback", END)
    .compile();
}
