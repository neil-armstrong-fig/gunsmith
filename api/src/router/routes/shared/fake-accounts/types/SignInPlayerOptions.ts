/** How a test wants its player signed in; unset, a display name of "Test Player" and a session good for a month. */
export interface SignInPlayerOptions {
  displayName?: string;
  expiresAt?: Date;
}
