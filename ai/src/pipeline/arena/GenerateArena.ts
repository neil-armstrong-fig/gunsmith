import {arenaHistoryOf} from "@gunsmith/ai/pipeline/arena/history/ArenaHistoryOf";
import {RequestUsage} from "@gunsmith/ai/pipeline/usage/RequestUsage";
import {createArenaGraph} from "@gunsmith/ai/pipeline/arena/arena-graph/CreateArenaGraph";
import {arenaOutcomeFromState} from "@gunsmith/ai/pipeline/arena/arena-graph/outcome/ArenaOutcomeFromState";
import type {ArenaOutcome} from "@gunsmith/ai/pipeline/arena/types/ArenaOutcome";
import type {ArenaPipelineDependencies} from "@gunsmith/ai/pipeline/arena/types/ArenaPipelineDependencies";
import type {GenerateArenaInput} from "@gunsmith/ai/pipeline/arena/types/GenerateArenaInput";

/**
 * Turns a player's words into an arena, or a rejection, or (when the model's arena cannot be used even after code's repair of it) a built-in arena. Only a request turned away before any model call is refunded. It
 * runs the request through the arena graph (`arena-graph/`, a fixed LangGraph `StateGraph`: the length pre-check, the moderation
 * judge, generation, code's check `validate` (which first mends what it can of the drawing, `repairArena`), at most one repair that puts the faults back to the model before the same check runs
 * again, and then the built-in arena) and reads the outcome off the state the run ended in. Model calls: moderation, generation and
 * at most one repair, three at most, two when nothing needs repairing.
 */
export async function generateArena(
  input: GenerateArenaInput,
  arenaPipelineDependencies: ArenaPipelineDependencies,
): Promise<ArenaOutcome> {
  const arenaGraph = createArenaGraph(arenaPipelineDependencies);
  const requestUsage = new RequestUsage();
  const endState = await arenaGraph.invoke({prompt: input.prompt}, {signal: input.signal, callbacks: [requestUsage]});

  return {...arenaOutcomeFromState(endState), usage: requestUsage.total(), history: arenaHistoryOf(endState)};
}
