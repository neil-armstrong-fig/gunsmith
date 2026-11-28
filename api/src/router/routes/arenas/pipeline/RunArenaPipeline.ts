import type {ArenaStyle} from "@gunsmith/shared/arena-style/ArenaStyle";
import {createArenaModels} from "@gunsmith/ai/adapter/arena/CreateArenaModels";
import {generateArena} from "@gunsmith/ai/pipeline/arena/GenerateArena";
import type {ArenaOutcome} from "@gunsmith/ai/pipeline/arena/types/ArenaOutcome";
import {workerEnvironment} from "@src/shared/env/WorkerEnvironment";

/**
 * Turns a player's words into an arena outcome: `@gunsmith/ai`'s `generateArena` with models built, for this request, from the
 * Worker's `ANTHROPIC_API_KEY` secret. The signal is the route's time limit (see
 * `RunWeaponPipeline`); the style is the one the player chose, if any. Fails without calling any model when the key is missing. Tests mock this module.
 */
export async function runArenaPipeline(prompt: string, signal: AbortSignal, style?: ArenaStyle): Promise<ArenaOutcome> {
  const apiKey = workerEnvironment.ANTHROPIC_API_KEY;
  if (apiKey === undefined || apiKey === "") {
    throw new Error("no ANTHROPIC_API_KEY is set");
  }

  return await generateArena({prompt, signal, style}, createArenaModels({apiKey}));
}
