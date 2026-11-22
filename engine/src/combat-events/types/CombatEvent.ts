import type {DamageTakenEvent} from "@gunsmith/engine/combat-events/types/DamageTakenEvent";
import type {FootstepEvent} from "@gunsmith/engine/combat-events/types/FootstepEvent";
import type {FireRefusedEvent} from "@gunsmith/engine/combat-events/types/FireRefusedEvent";
import type {HeardEvent} from "@gunsmith/engine/combat-events/types/HeardEvent";
import type {HitLandedEvent} from "@gunsmith/engine/combat-events/types/HitLandedEvent";
import type {PickupTakenEvent} from "@gunsmith/engine/combat-events/types/PickupTakenEvent";
import type {ReloadStartedEvent} from "@gunsmith/engine/combat-events/types/ReloadStartedEvent";
import type {ShotFiredEvent} from "@gunsmith/engine/combat-events/types/ShotFiredEvent";

/**
 * Something that happened to the local player in one step, for the caller to show or play. Never about what they cannot see:
 * the one thing it says of the other fighter out of sight is the direction of a shot (`HeardEvent`).
 */
export type CombatEvent =
  | ShotFiredEvent
  | FootstepEvent
  | FireRefusedEvent
  | DamageTakenEvent
  | HitLandedEvent
  | PickupTakenEvent
  | ReloadStartedEvent
  | HeardEvent;
