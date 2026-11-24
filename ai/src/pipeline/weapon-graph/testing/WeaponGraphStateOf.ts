import type {WeaponGraphStateValues} from "@gunsmith/ai/pipeline/weapon-graph/state/types/WeaponGraphStateValues";

/** A state where nothing has happened yet, with the fields a test cares about changed. Test-only. */
export function weaponGraphStateOf(overrides: Partial<WeaponGraphStateValues> = {}): WeaponGraphStateValues {
  return {
    prompt: "a rifle",
    rejectionReason: undefined,
    relevance: undefined,
    codeEdits: 0,
    draft: undefined,
    candidate: undefined,
    weapon: undefined,
    errors: [],
    repaired: false,
    appearance: undefined,
    nodes: [],
    modelCalls: 0,
    ...overrides,
  };
}
