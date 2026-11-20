import type {CombatEvent} from "@gunsmith/engine/combat-events/types/CombatEvent";

/** What the snapshots that arrived since it was last asked for said happened to this player, and how much game time they cover. */
export interface EventsOfSnapshots {
  /** Every event those snapshots carried, in the order they came. Empty when they carried none. */
  events: readonly CombatEvent[];
  /** The game time those snapshots cover, in seconds: what the sounds' own clocks run on. */
  seconds: number;
}
