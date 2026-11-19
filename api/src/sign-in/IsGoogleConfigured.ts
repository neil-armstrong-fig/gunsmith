import {workerEnvironment} from "@src/env/WorkerEnvironment";

/** Whether the OAuth client's id and secret are both set (and not empty). Unset, every sign-in attempt returns the player signed out. */
export function isGoogleConfigured(): boolean {
  return Boolean(workerEnvironment.GOOGLE_OAUTH_CLIENT_ID) && Boolean(workerEnvironment.GOOGLE_OAUTH_CLIENT_SECRET);
}
