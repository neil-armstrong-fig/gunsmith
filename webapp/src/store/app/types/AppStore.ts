/**
 * Everything the app store holds: what the player has chosen about the game around the match, not the match itself.
 * Today that is whether the sound is off; menus, lobby, library and credits arrive here when a screen needs them.
 */
export interface AppStore {
  /** Whether the game is silent. Starts as the page's query (`?mute=1`) asks, and the M key flips it. */
  muted: boolean;
  toggleMuted: () => void;
}
