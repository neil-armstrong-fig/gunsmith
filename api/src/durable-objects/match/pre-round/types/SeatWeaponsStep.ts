import type {WeaponSlot} from "@src/durable-objects/match/pre-round/types/WeaponSlot";
import type {WeaponSlotState} from "@src/durable-objects/match/pre-round/types/WeaponSlotState";

/** The weapons step as the room holds it for one seat: slot 1 and slot 2, each chosen and locked in on its own. */
export type SeatWeaponsStep = Record<WeaponSlot, WeaponSlotState>;
