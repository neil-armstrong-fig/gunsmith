/** What the server lets a seat know of the other while choosing: flags, and their arena's name only once both are locked in. */
export interface OpponentPreRound {
  locked: boolean;
  picked: boolean;
  arena?: string;
}
