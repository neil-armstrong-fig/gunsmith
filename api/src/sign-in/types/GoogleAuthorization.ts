/** One sign-in attempt as Google is told of it: the random `state`, the PKCE verifier (only its challenge is sent) and where Google returns to. */
export interface GoogleAuthorization {
  state: string;
  codeVerifier: string;
  redirectUri: string;
}
