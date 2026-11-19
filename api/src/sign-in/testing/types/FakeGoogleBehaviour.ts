/** How a test wants the stand-in for Google to behave; unset, it sends the player on and says their subject is "google-sub-1". */
export interface FakeGoogleBehaviour {
  subject?: string;
  failsToSendThePlayer?: boolean;
  failsToExchange?: boolean;
}
