import type {Scenario} from "@src/game/scenario/types/Scenario";
import type {MenuView} from "@src/store/app/types/MenuView";

/**
 * Everything the app store holds: what the player has chosen about the game around the match, not the match itself.
 * It holds sound and motion preferences, plus online round readiness and connection state. Menus, lobby, library and credits arrive here when a screen needs them.
 */
export interface AppStore {
  /** Whether the game is silent. Starts as the page's query (`?mute=1`) asks, and the M key flips it. */
  muted: boolean;
  /** Whether the person wants less motion: no camera shake, brackets that do not open outward and a health bar that does not trail. Read once from the page (`?reducedMotion=1`, or the system's `prefers-reduced-motion`). */
  reducedMotion: boolean;
  /** How hard a hit shakes the camera at most, in screen pixels: 12 by default (the user's choice; art's study said 2), or what the page's query (`?shake=<pixels>`) asks; 0 is off. */
  shakePixels: number;
  /** Whether the dim veil over what the player does not see is drawn: always, unless the page's query (`?fog=off`) asks otherwise, for specs that photograph the terrain. Read once from the page; sight itself is unchanged. */
  fogShown: boolean;
  toggleMuted: () => void;
  scenario: Scenario;
  menuView: MenuView | undefined;
  showMenu: (view: MenuView | undefined) => void;
  showMenuOnStartup: boolean;
  setShowMenuOnStartup: (show: boolean) => void;
  /** Whether the workshop's panel is open over the practice range. While it is, the game waits: no time passes and the keys typed in it are not the game's. */
  workshopOpen: boolean;
  openWorkshop: () => void;
  closeWorkshop: () => void;
  /** Online only: the player pressed "Next round" (or "Play again") and the loop has not yet sent it to the server. */
  nextRoundAsked: boolean;
  askForNextRound: () => void;
  /** Gives the player's ask once, and forgets it: `true` the first time after an ask, `false` until the next one. */
  takeNextRoundAsk: () => boolean;
  /** Online only: the server has this player's ask and is waiting for the other player to ask too. Written by the loop from what the server says. */
  waitingForOtherPlayer: boolean;
  setWaitingForOtherPlayer: (waiting: boolean) => void;
  /** Online only: the connection to the server was lost and is being made again; the seat is kept for this player meanwhile. Written by the loop. */
  reconnecting: boolean;
  setReconnecting: (reconnecting: boolean) => void;
}
