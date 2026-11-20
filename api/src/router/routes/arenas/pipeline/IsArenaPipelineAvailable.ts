import {workerEnvironment} from "@src/env/WorkerEnvironment";

/** Whether the Worker has an arena pipeline to run: once the `ANTHROPIC_API_KEY` secret is set (see `IsWeaponPipelineAvailable`). Tests mock this module. */
export function isArenaPipelineAvailable(): boolean {
  return workerEnvironment.ANTHROPIC_API_KEY !== undefined && workerEnvironment.ANTHROPIC_API_KEY !== "";
}
