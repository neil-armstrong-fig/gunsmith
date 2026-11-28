import type {WeaponGraphState} from "@gunsmith/ai/pipeline/weapon/graph/state/WeaponGraphState";

/** What a node hands back: only the fields it changes. */
export type WeaponGraphUpdate = typeof WeaponGraphState.Update;
