/** A decoded export's join: where it wraps, for the key that says whether it is a loop at all. */
export interface LoopCheck {
  key: string;
  name: string;
  loopJump: number;
}
