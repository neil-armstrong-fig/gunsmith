import type {ArenaView} from "@src/durable-objects/match/pre-round/types/ArenaView";
import type {WeaponsOfSeat} from "@src/durable-objects/match/pre-round/types/WeaponsOfSeat";

/**
 * What a seat may be told about the other: whether they are locked in and have picked (flags only, they tell nothing about the choice),
 * their arena only once both seats are locked in and so both arenas are shown (a saved one with its drawing), and their weapons step:
 * `locked` always, the pair itself only once both seats have locked in their weapons.
 */
export interface OpponentPreRound {
  locked: boolean;
  picked: boolean;
  arena?: ArenaView;
  weapons: WeaponsOfSeat;
}
