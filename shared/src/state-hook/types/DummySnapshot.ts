/**
 * Where a practice dummy stands, in tiles, how much health it has left, and whether the player sees it. A dummy with no
 * health left is not listed; one outside the player's cone is listed, since the spec sees what the game knows.
 */
export interface DummySnapshot {
  x: number;
  y: number;
  health: number;
  /** Whether it is inside the player's cone with no wall or higher ground in the way. The game does not draw it when it is not. */
  visible: boolean;
}
