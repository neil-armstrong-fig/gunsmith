import {workerEnvironment} from "@src/env/WorkerEnvironment";
import {subjectDigest} from "@src/router/routes/shared/subject-digest/SubjectDigest";
import {createHmac} from "node:crypto";

it("is the hex HMAC-SHA256 of the Google subject under the Worker's key", async () => {
  workerEnvironment.ACCOUNT_DIGEST_KEY = "key-1";

  expect(await subjectDigest("sub-1")).toBe(createHmac("sha256", "key-1").update("sub-1").digest("hex"));
});

it("is the same for the same subject and key", async () => {
  workerEnvironment.ACCOUNT_DIGEST_KEY = "key-1";

  expect(await subjectDigest("sub-1")).toBe(await subjectDigest("sub-1"));
});

it("differs for another subject and for another key, and shows nothing of the subject", async () => {
  workerEnvironment.ACCOUNT_DIGEST_KEY = "key-1";
  const first = await subjectDigest("sub-1");
  const other = await subjectDigest("sub-2");
  workerEnvironment.ACCOUNT_DIGEST_KEY = "key-2";
  const rekeyed = await subjectDigest("sub-1");

  expect(new Set([first, other, rekeyed]).size).toBe(3);
  expect(first).not.toContain("sub-1");
});

it("refuses to make a digest when no key is set, rather than make one anyone could reproduce", async () => {
  await expect(subjectDigest("sub-1")).rejects.toThrow("ACCOUNT_DIGEST_KEY");
});

it("refuses an empty key too", async () => {
  workerEnvironment.ACCOUNT_DIGEST_KEY = "";

  await expect(subjectDigest("sub-1")).rejects.toThrow("ACCOUNT_DIGEST_KEY");
});
