import type {WeaponsOfSeat} from "@src/durable-objects/match/pre-round/types/WeaponsOfSeat";

/**
 * What a seat may be told about the other: whether they are locked in and have picked (flags only, they tell nothing about the choice),
 * their arena's name only once both seats are locked in and so both arenas are shown, and their weapons step: `locked` always, the pair
 * itself only once both seats have locked in their weapons.
 */
export interface OpponentPreRound {
  locked: boolean;
  picked: boolean;
  arena?: string;
  weapons: WeaponsOfSeat;
}
