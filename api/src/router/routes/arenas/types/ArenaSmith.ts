import type {ArenaOutcome} from "@gunsmith/ai/pipeline/arena/types/ArenaOutcome";

/**
 * What turns a player's words into an arena outcome: `@gunsmith/ai`'s `generateArena` with its models, once the Worker has them.
 * A route is handed it rather than building it, so a test passes a plain function and the Worker passes none until a production
 * adapter exists (the route then answers `ai-unavailable` and takes nothing).
 */
export type ArenaSmith = (prompt: string) => Promise<ArenaOutcome>;
