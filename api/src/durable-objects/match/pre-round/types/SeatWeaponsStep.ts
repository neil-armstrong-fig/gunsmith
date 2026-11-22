import type {ChosenWeapons} from "@src/durable-objects/match/pre-round/types/ChosenWeapons";

/** The weapons step as the room holds it for one seat: the pair put forward (once it has) and whether it is locked in. */
export interface SeatWeaponsStep {
  chosen?: ChosenWeapons;
  locked: boolean;
}
