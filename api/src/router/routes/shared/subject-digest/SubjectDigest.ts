import {workerEnvironment} from "@src/shared/env/WorkerEnvironment";

/**
 * What stands for a Google subject once its account is deleted: the hex HMAC-SHA256 of the subject under `ACCOUNT_DIGEST_KEY` (a secret).
 * **Keyed on purpose**: Google subjects are short numbers, so an unkeyed hash of one could be reversed by trying them all. Still
 * personal data while it is kept (`docs/privacy-and-data.md`). Throws without a key, never falling back to something reproducible.
 */
export async function subjectDigest(googleSub: string): Promise<string> {
  const key = workerEnvironment.ACCOUNT_DIGEST_KEY;
  if (!key) {
    throw new Error("ACCOUNT_DIGEST_KEY is not set");
  }

  const hmacKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(key),
    {name: "HMAC", hash: "SHA-256"},
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", hmacKey, new TextEncoder().encode(googleSub));

  return Array.from(new Uint8Array(signature), byte => byte.toString(16).padStart(2, "0")).join("");
}
