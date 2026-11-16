import type {Fighters} from "@gunsmith/engine/pickup/types/Fighters";
import type {Pickup} from "@gunsmith/engine/pickup/types/Pickup";

/** What is left after a step's chance to take a pickup: the pickup if nobody took it, and both fighters, the taker now holding its weapon. */
export interface PickupTaking extends Fighters {
  pickup: Pickup | undefined;
}
