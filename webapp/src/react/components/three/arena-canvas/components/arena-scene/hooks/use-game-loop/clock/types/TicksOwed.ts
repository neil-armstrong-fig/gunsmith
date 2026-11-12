/** How many whole simulation steps a frame owes, and the time left over towards the next one. */
export interface TicksOwed {
  ticks: number;
  leftoverSeconds: number;
}
