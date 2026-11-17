import type {TriggerRefusal} from "@gunsmith/engine/weapon/types/TriggerRefusal";

/** The local player held the trigger on a weapon that was ready but had nothing to fire: what an empty click is made from. */
export interface FireRefusedEvent {
  kind: "fireRefused";
  reason: TriggerRefusal;
}
