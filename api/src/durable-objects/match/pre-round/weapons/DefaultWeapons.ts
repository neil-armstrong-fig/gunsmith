import type {ChosenWeapons} from "@src/durable-objects/match/pre-round/types/ChosenWeapons";

/** What a seat carries when it locks in without choosing, or runs out of time: the rifle in slot 1 and the marksman rifle in slot 2, as the engine's starting loadout has them. */
export const DEFAULT_WEAPONS: ChosenWeapons = [
  {kind: "builtIn", key: "rifle"},
  {kind: "builtIn", key: "marksman-rifle"},
];
