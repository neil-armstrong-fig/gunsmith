import {workerEnvironment} from "@src/env/WorkerEnvironment";

/**
 * Whether the Worker has a weapon pipeline to run: it does once the `ANTHROPIC_API_KEY` secret is set, which is the one act that
 * lets a request cost money. Without it the route answers `ai-unavailable` before it takes a credit or any spend. Tests mock this module.
 */
export function isWeaponPipelineAvailable(): boolean {
  return workerEnvironment.ANTHROPIC_API_KEY !== undefined && workerEnvironment.ANTHROPIC_API_KEY !== "";
}
