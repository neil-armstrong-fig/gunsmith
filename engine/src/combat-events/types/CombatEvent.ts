import type {DamageTakenEvent} from "@gunsmith/engine/combat-events/types/DamageTakenEvent";
import type {FireRefusedEvent} from "@gunsmith/engine/combat-events/types/FireRefusedEvent";
import type {HeardEvent} from "@gunsmith/engine/combat-events/types/HeardEvent";
import type {HitLandedEvent} from "@gunsmith/engine/combat-events/types/HitLandedEvent";
import type {PickupTakenEvent} from "@gunsmith/engine/combat-events/types/PickupTakenEvent";

/**
 * Something that happened to the local player in one step, for the caller to show or play. Never about what they cannot see:
 * the one thing it says of the other fighter out of sight is the direction of a shot (`HeardEvent`).
 */
export type CombatEvent = FireRefusedEvent | DamageTakenEvent | HitLandedEvent | PickupTakenEvent | HeardEvent;
