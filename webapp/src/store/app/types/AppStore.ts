/**
 * Everything the app store holds: what the player has chosen about the game around the match, not the match itself.
 * Today that is whether the sound is off and, in an online room, the player's ask to go on to the next round; menus, lobby,
 * library and credits arrive here when a screen needs them.
 */
export interface AppStore {
  /** Whether the game is silent. Starts as the page's query (`?mute=1`) asks, and the M key flips it. */
  muted: boolean;
  toggleMuted: () => void;
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
