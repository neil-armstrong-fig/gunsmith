import type {ArenaGraphStateValues} from "@gunsmith/ai/pipeline/arena/arena-graph/state/types/ArenaGraphStateValues";

/** A state where nothing has happened yet, with the fields a test cares about changed. Test-only. */
export function arenaGraphStateOf(overrides: Partial<ArenaGraphStateValues> = {}): ArenaGraphStateValues {
  return {
    prompt: "an arena with pillars",
    rejectionReason: undefined,
    draft: undefined,
    arena: undefined,
    errors: [],
    repaired: false,
    relevance: undefined,
    validationFailure: undefined,
    codeEdits: 0,
    builtIn: undefined,
    nodes: [],
    modelCalls: 0,
    ...overrides,
  };
}
