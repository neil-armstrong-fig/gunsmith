import type {ArenaView} from "@src/durable-objects/match/pre-round/types/ArenaView";
import type {WeaponsOfSeat} from "@src/durable-objects/match/pre-round/types/WeaponsOfSeat";

/**
 * What a seat may be told about the other: whether they are locked in and have picked (flags only, they tell nothing about the choice),
 * their arena only once both seats are locked in and so both arenas are shown (a saved one with its drawing), and their weapons step:
 * each slot's `locked` always, the weapon in it only once both seats have locked in that slot.
 */
export interface OpponentPreRound {
  locked: boolean;
  picked: boolean;
  arena?: ArenaView;
  weapons: WeaponsOfSeat;
  /** While the decided arena and weapons are shown: whether the other seat has asked to begin the match (a flag, it tells nothing else). Absent before then. */
  ready?: boolean;
}
