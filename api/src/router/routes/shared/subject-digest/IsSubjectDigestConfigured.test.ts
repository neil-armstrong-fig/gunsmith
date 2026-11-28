import {workerEnvironment} from "@src/shared/env/WorkerEnvironment";
import {isSubjectDigestConfigured} from "@src/router/routes/shared/subject-digest/IsSubjectDigestConfigured";

it("is true when a key is set", () => {
  workerEnvironment.ACCOUNT_DIGEST_KEY = "key-1";

  expect(isSubjectDigestConfigured()).toBe(true);
});

it("is false when the key is unset or empty", () => {
  expect(isSubjectDigestConfigured()).toBe(false);

  workerEnvironment.ACCOUNT_DIGEST_KEY = "";

  expect(isSubjectDigestConfigured()).toBe(false);
});
