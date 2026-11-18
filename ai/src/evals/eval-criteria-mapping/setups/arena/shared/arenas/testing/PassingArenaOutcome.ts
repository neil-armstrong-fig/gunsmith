import type {ArenaOutcome} from "@gunsmith/ai/pipeline/arena/types/ArenaOutcome";

/** An arena request that ended well: the model's own arena, on the clean path. Test-only. */
export function passingArenaOutcome(overrides: Partial<ArenaOutcome> = {}): ArenaOutcome {
  return {
    status: "created",
    arena: {name: "Pillars", rows: ["#####", "#...#", "#####"]},
    refunded: false,
    nodes: ["precheck", "moderation", "generate", "validate"],
    modelCalls: 2,
    ...overrides,
  };
}
