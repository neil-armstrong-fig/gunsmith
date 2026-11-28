import {createWeaponModels} from "@gunsmith/ai/adapter/weapon/CreateWeaponModels";
import {generateWeapon} from "@gunsmith/ai/pipeline/weapon/GenerateWeapon";
import type {WeaponOutcome} from "@gunsmith/ai/pipeline/weapon/types/WeaponOutcome";
import {workerEnvironment} from "@src/shared/env/WorkerEnvironment";

/**
 * Turns a player's words into a weapon outcome: `@gunsmith/ai`'s `generateWeapon` with models built, for this request, from the
 * Worker's `ANTHROPIC_API_KEY` secret. The signal is the route's time limit: once it aborts, no stage starts and the model call in
 * flight is told to stop, and the request rejects. Fails without calling any model when the key is missing (the route does not call
 * this then: `isWeaponPipelineAvailable`). Tests mock this module.
 */
export async function runWeaponPipeline(prompt: string, signal: AbortSignal): Promise<WeaponOutcome> {
  const apiKey = workerEnvironment.ANTHROPIC_API_KEY;
  if (apiKey === undefined || apiKey === "") {
    throw new Error("no ANTHROPIC_API_KEY is set");
  }

  return await generateWeapon({prompt, signal}, createWeaponModels({apiKey}));
}
