/** What the screen shows round a target that a bullet has just hit, counted as the corners of its body that carry one of the mint ticks of a hit landed. */
export interface HitLook {
  /** How many of the four corners round the body show a tick: four while the confirmation is on the screen, none otherwise. */
  cornersWithTicks: number;
}
