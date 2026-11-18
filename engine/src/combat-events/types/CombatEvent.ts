import type {DamageTakenEvent} from "@gunsmith/engine/combat-events/types/DamageTakenEvent";
import type {FireRefusedEvent} from "@gunsmith/engine/combat-events/types/FireRefusedEvent";
import type {HitLandedEvent} from "@gunsmith/engine/combat-events/types/HitLandedEvent";
import type {PickupTakenEvent} from "@gunsmith/engine/combat-events/types/PickupTakenEvent";

/** Something that happened to the local player in one step, for the caller to show or play. Never about what they cannot see. */
export type CombatEvent = FireRefusedEvent | DamageTakenEvent | HitLandedEvent | PickupTakenEvent;
