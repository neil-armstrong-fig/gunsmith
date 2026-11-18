/**
 * Everything the app store holds: what the player has chosen about the game around the match, not the match itself.
 * Today that is whether the sound is off and how much the screen may move; menus, lobby, library and credits arrive here when a screen needs them.
 */
export interface AppStore {
  /** Whether the game is silent. Starts as the page's query (`?mute=1`) asks, and the M key flips it. */
  muted: boolean;
  /** Whether the person wants less motion: no camera shake, brackets that do not open outward and a health bar that does not trail. Read once from the page (`?reducedMotion=1`, or the system's `prefers-reduced-motion`). */
  reducedMotion: boolean;
  /** How hard a hit shakes the camera at most, in screen pixels: 12 by default (the user's choice; art's study said 2), or what the page's query (`?shake=<pixels>`) asks; 0 is off. */
  shakePixels: number;
  toggleMuted: () => void;
}
