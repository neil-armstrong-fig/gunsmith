import type {WeaponOutcome} from "@gunsmith/ai/pipeline/types/WeaponOutcome";

/**
 * What turns a player's words into a weapon outcome: `@gunsmith/ai`'s `generateWeapon` with its models, once the Worker has them.
 * A route is handed it rather than building it, so a test passes a plain function and the Worker passes none until a production
 * adapter exists (the route then answers `ai-unavailable` and takes nothing).
 */
export type WeaponSmith = (prompt: string) => Promise<WeaponOutcome>;
