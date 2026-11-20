/**
 * What a seat may be told about the other: whether they are locked in and have picked (flags only, they tell nothing about the choice),
 * and their arena's name only once both seats are locked in and so both arenas are shown.
 */
export interface OpponentPreRound {
  locked: boolean;
  picked: boolean;
  arena?: string;
}
