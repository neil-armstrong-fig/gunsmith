import type {DamageTakenEvent} from "@gunsmith/engine/combat-events/types/DamageTakenEvent";
import type {FireRefusedEvent} from "@gunsmith/engine/combat-events/types/FireRefusedEvent";

/** Something that happened to the local player in one step, for the caller to show or play. Never about what they cannot see. */
export type CombatEvent = FireRefusedEvent | DamageTakenEvent;
