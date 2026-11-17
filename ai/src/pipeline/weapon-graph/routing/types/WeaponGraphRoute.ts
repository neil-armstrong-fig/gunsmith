import type {WeaponGraphStateValues} from "@gunsmith/ai/pipeline/weapon-graph/state/types/WeaponGraphStateValues";

/** Decides, from the state, which node runs next (or the end of the run): the function behind a conditional edge. */
export type WeaponGraphRoute = (state: WeaponGraphStateValues) => string;
