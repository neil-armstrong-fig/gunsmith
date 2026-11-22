import {createArenaModels} from "@gunsmith/ai/adapter/CreateArenaModels";
import {generateArena} from "@gunsmith/ai/pipeline/arena/GenerateArena";
import type {ArenaOutcome} from "@gunsmith/ai/pipeline/arena/types/ArenaOutcome";
import {BUILT_IN_ARENAS} from "@gunsmith/engine/built-in-arenas/BuiltInArenas";
import {workerEnvironment} from "@src/env/WorkerEnvironment";

/**
 * Turns a player's words into an arena outcome: `@gunsmith/ai`'s `generateArena` with models built, for this request, from the
 * Worker's `ANTHROPIC_API_KEY` secret and the engine's built-in arenas to fall back on. The signal is the route's time limit (see
 * `RunWeaponPipeline`). Fails without calling any model when the key is missing. Tests mock this module.
 */
export async function runArenaPipeline(prompt: string, signal: AbortSignal): Promise<ArenaOutcome> {
  const apiKey = workerEnvironment.ANTHROPIC_API_KEY;
  if (apiKey === undefined || apiKey === "") {
    throw new Error("no ANTHROPIC_API_KEY is set");
  }

  return await generateArena({prompt, signal}, {...createArenaModels({apiKey}), builtInArenas: BUILT_IN_ARENAS});
}
