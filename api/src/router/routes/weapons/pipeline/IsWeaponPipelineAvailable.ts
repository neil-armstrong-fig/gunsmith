/**
 * Whether the Worker has a weapon pipeline to run. **False until a production adapter is wired**: the route then answers
 * `ai-unavailable` before it takes a credit or any spend. Tests mock this module.
 */
export function isWeaponPipelineAvailable(): boolean {
  return false;
}
