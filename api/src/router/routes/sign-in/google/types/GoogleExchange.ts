/** What a returning player brings back: Google's `code` and the `state` it came with, against the `state` the attempt began with. */
export interface GoogleExchange {
  code: string;
  receivedState: string;
  expectedState: string;
  codeVerifier: string;
  redirectUri: string;
}
