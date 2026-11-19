/** One sign-in attempt, kept in a short cookie between the start and the callback: Google's `state`, the PKCE verifier and where to send the player back. */
export interface OAuthAttempt {
  state: string;
  codeVerifier: string;
  returnTo: string;
}
