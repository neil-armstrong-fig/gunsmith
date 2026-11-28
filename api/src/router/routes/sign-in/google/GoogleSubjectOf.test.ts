import {workerEnvironment} from "@src/shared/env/WorkerEnvironment";
import {googleSubjectOf} from "@src/router/routes/sign-in/google/GoogleSubjectOf";
import type {GoogleExchange} from "@src/router/routes/sign-in/google/types/GoogleExchange";

vi.unmock("@src/router/routes/sign-in/google/GoogleSubjectOf");

const RFC_VERIFIER = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";
const CLIENT_ID = "client-1.apps.test";
const REDIRECT_URI = "https://gunsmith.test/api/auth/google/callback";

beforeEach(() => {
  workerEnvironment.GOOGLE_OAUTH_CLIENT_ID = CLIENT_ID;
  workerEnvironment.GOOGLE_OAUTH_CLIENT_SECRET = "secret-1";
});

afterEach(() => {
  vi.unstubAllGlobals();
});

it("exchanges the code and the verifier at Google's token endpoint, and answers the subject", async () => {
  const google = standInForGoogle({sub: "google-sub-1"});
  vi.stubGlobal("fetch", google.fetch);

  const subject = await googleSubjectOf(exchange());

  expect(subject).toBe("google-sub-1");
  expect(google.tokenRequests).toHaveLength(1);
  expect(google.tokenRequests[0]).toEqual({
    url: "https://oauth2.googleapis.com/token",
    form: {
      grant_type: "authorization_code",
      code: "code-1",
      code_verifier: RFC_VERIFIER,
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      client_secret: "secret-1",
    },
  });
});

it("refuses a state that is not the one the attempt began with", async () => {
  const google = standInForGoogle({sub: "google-sub-1"});
  vi.stubGlobal("fetch", google.fetch);

  await expect(googleSubjectOf({...exchange(), receivedState: "someone-elses"})).rejects.toThrow();
  expect(google.tokenRequests).toHaveLength(0);
});

it("refuses an ID token made for another client", async () => {
  const google = standInForGoogle({sub: "google-sub-1", audience: "another-client"});
  vi.stubGlobal("fetch", google.fetch);

  await expect(googleSubjectOf(exchange())).rejects.toThrow();
});

it("refuses an ID token from another issuer", async () => {
  const google = standInForGoogle({sub: "google-sub-1", issuer: "https://evil.test"});
  vi.stubGlobal("fetch", google.fetch);

  await expect(googleSubjectOf(exchange())).rejects.toThrow();
});

it("refuses an ID token that has expired", async () => {
  const google = standInForGoogle({sub: "google-sub-1", expiresInSeconds: -3600});
  vi.stubGlobal("fetch", google.fetch);

  await expect(googleSubjectOf(exchange())).rejects.toThrow();
});

it("refuses an answer with no ID token", async () => {
  const google = standInForGoogle({sub: "google-sub-1", withoutIdToken: true});
  vi.stubGlobal("fetch", google.fetch);

  await expect(googleSubjectOf(exchange())).rejects.toThrow();
});

it("refuses a code Google turned down", async () => {
  const google = standInForGoogle({sub: "google-sub-1", status: 400});
  vi.stubGlobal("fetch", google.fetch);

  await expect(googleSubjectOf(exchange())).rejects.toThrow();
});

function exchange(): GoogleExchange {
  return {
    code: "code-1",
    receivedState: "state-1",
    expectedState: "state-1",
    codeVerifier: RFC_VERIFIER,
    redirectUri: REDIRECT_URI,
  };
}

interface StandIn {
  sub: string;
  audience?: string;
  issuer?: string;
  expiresInSeconds?: number;
  withoutIdToken?: boolean;
  status?: number;
}

interface StandInForGoogle {
  fetch: typeof fetch;
  tokenRequests: TokenRequest[];
}

interface TokenRequest {
  url: string;
  form: Record<string, string>;
}

/** A token endpoint that answers whatever `StandIn` says and keeps what it was asked. Its ID token is unsigned: Google's is not checked either. */
function standInForGoogle(standIn: StandIn): StandInForGoogle {
  const tokenRequests: TokenRequest[] = [];
  const stand = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    tokenRequests.push({
      url: String(input),
      form: Object.fromEntries(new URLSearchParams(String(init?.body))),
    });
    if (standIn.status && standIn.status !== 200) {
      return Response.json({error: "invalid_grant"}, {status: standIn.status});
    }

    const now = Math.floor(Date.now() / 1000);
    const claims = {
      iss: standIn.issuer ?? "https://accounts.google.com",
      aud: standIn.audience ?? CLIENT_ID,
      sub: standIn.sub,
      iat: now,
      exp: now + (standIn.expiresInSeconds ?? 3600),
    };

    return Response.json({
      access_token: "access-1",
      token_type: "Bearer",
      expires_in: 3600,
      ...(standIn.withoutIdToken ? {} : {id_token: unsignedToken(claims)}),
    });
  };

  return {fetch: stand as typeof fetch, tokenRequests};
}

function unsignedToken(claims: Record<string, unknown>): string {
  return [{alg: "RS256", typ: "JWT"}, claims].map(part => base64Url(JSON.stringify(part))).join(".") + ".signature";
}

function base64Url(text: string): string {
  return btoa(text).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}
