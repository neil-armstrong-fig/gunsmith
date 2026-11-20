import {workerEnvironment} from "@src/env/WorkerEnvironment";

/** Whether the key that makes a deleted account's digest is set (and not empty). Without it, an account cannot be deleted. */
export function isSubjectDigestConfigured(): boolean {
  return Boolean(workerEnvironment.ACCOUNT_DIGEST_KEY);
}
