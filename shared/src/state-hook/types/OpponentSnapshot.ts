/**
 * Where the opponent stands, in tiles, how much health it has left, and the rounds in the magazine of the weapon it
 * holds. It stays listed at zero, once it has fallen.
 */
export interface OpponentSnapshot {
  x: number;
  y: number;
  health: number;
  /** The rounds in the magazine of the weapon in its hands. */
  rounds: number;
  /** Whether the player sees it: inside the player's cone, with no wall or higher ground in the way. The game does not draw it when not. */
  visible: boolean;
  /**
   * What it is doing (`wander`, `engage`, `reload` or `search`), as the engine names it. Plain text here, since `shared/`
   * cannot read the engine's list; absent when the opponent has no brain and takes no action.
   */
  behaviour?: string | undefined;
}
