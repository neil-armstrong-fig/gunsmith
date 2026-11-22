/** How the middle of a weapon's body reads against the floor beside it, over places sampled where the body is drawn. */
export interface PickupBodyLook {
  /** How many places were read across the body. */
  sampled: number;

  /** How many of them differ from the floor in the same light by more than the eye needs to tell them apart. */
  apartFromFloor: number;
}
