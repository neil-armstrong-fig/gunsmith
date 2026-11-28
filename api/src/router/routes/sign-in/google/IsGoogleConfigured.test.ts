import {workerEnvironment} from "@src/shared/env/WorkerEnvironment";
import {isGoogleConfigured} from "@src/router/routes/sign-in/google/IsGoogleConfigured";

it("is true when the client's id and secret are both set", () => {
  workerEnvironment.GOOGLE_OAUTH_CLIENT_ID = "id-1";
  workerEnvironment.GOOGLE_OAUTH_CLIENT_SECRET = "secret-1";

  expect(isGoogleConfigured()).toBe(true);
});

it("is false when either is missing or empty", () => {
  Reflect.deleteProperty(workerEnvironment, "GOOGLE_OAUTH_CLIENT_ID");
  Reflect.deleteProperty(workerEnvironment, "GOOGLE_OAUTH_CLIENT_SECRET");
  expect(isGoogleConfigured()).toBe(false);

  workerEnvironment.GOOGLE_OAUTH_CLIENT_ID = "id-1";
  expect(isGoogleConfigured()).toBe(false);

  workerEnvironment.GOOGLE_OAUTH_CLIENT_SECRET = "";
  expect(isGoogleConfigured()).toBe(false);
});
