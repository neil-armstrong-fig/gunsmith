/** How the weapon lying in the arena looks on the screen, counted by colour over places sampled where it is drawn. */
export interface PickupLook {
  /** How many places show the weapon blue, the lantern's cage (and the stand-in's muzzle). Nothing else near a pickup is that blue. */
  bluePixels: number;

  /** How many show the pale text grey, the lantern's core, which the stand-in does not have. */
  palePixels: number;

  /** How many show the mint of the placeholder disc the drawing replaces, as tone mapping makes it look on the screen; no drawing here uses that colour. */
  discPixels: number;

  /**
   * How many places are not the colour most of the square is (the floor, or the fog over it), by more than a drawing's dimming would hide. In the fog a drawing is
   * dimmed, not hidden, so its exact colours are never found there; any mark at all says something is drawn over the floor.
   */
  markedPixels: number;
}
