import type {ChosenWeapon} from "@src/durable-objects/match/pre-round/types/ChosenWeapon";

/** The two weapons a seat carries, slot 1 then slot 2. */
export type ChosenWeapons = readonly [ChosenWeapon, ChosenWeapon];
