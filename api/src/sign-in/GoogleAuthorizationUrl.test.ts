import {workerEnvironment} from "@src/env/WorkerEnvironment";
import {googleAuthorizationUrl} from "@src/sign-in/GoogleAuthorizationUrl";

vi.unmock("@src/sign-in/GoogleAuthorizationUrl");

// RFC 7636, appendix B: this verifier must give this S256 challenge.
const RFC_VERIFIER = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";
const RFC_CHALLENGE = "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM";

const CLIENT_ID = "client-1.apps.test";
const REDIRECT_URI = "https://gunsmith.test/api/auth/google/callback";

beforeEach(() => {
  workerEnvironment.GOOGLE_OAUTH_CLIENT_ID = CLIENT_ID;
});

it("sends the player to Google's authorization endpoint, asking for openid only", async () => {
  const url = await googleAuthorizationUrl({
    state: "state-1",
    codeVerifier: RFC_VERIFIER,
    redirectUri: REDIRECT_URI,
  });

  expect(`${url.origin}${url.pathname}`).toBe("https://accounts.google.com/o/oauth2/v2/auth");
  expect(Object.fromEntries(url.searchParams)).toEqual({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: "openid",
    state: "state-1",
    code_challenge: RFC_CHALLENGE,
    code_challenge_method: "S256",
  });
});
