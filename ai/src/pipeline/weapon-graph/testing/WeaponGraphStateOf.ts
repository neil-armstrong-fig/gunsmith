import type {WeaponGraphStateValues} from "@gunsmith/ai/pipeline/weapon-graph/state/WeaponGraphState";

/** A state where nothing has happened yet, with the fields a test cares about changed. Test-only. */
export function weaponGraphStateOf(overrides: Partial<WeaponGraphStateValues> = {}): WeaponGraphStateValues {
  return {
    prompt: "a rifle",
    rejectionReason: undefined,
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
