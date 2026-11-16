/**
 * A weapon lying in the arena for a fighter to take: where it lies in tiles, whether the player sees it, and what the weapon
 * would hold the moment it was taken. One that has been taken is not listed; one outside the player's cone is listed, since
 * the spec sees what the game knows.
 */
export interface PickupSnapshot {
  x: number;
  y: number;
  /** Whether it is inside the player's cone with no wall or higher ground in the way. The game does not draw it when it is not. */
  visible: boolean;
  /** Rounds in the magazine of the weapon it holds: what the fighter who takes it has in the magazine. */
  magazineSize: number;
  /** Rounds in the reserve of the weapon it holds: what the fighter who takes it has in the reserve. */
  startingReserve: number;
}
