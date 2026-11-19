import {testAccounts} from "@src/accounts/testing/in-memory/TestAccounts";
import {workerEnvironment} from "@src/env/WorkerEnvironment";
import {testGoogle} from "@src/sign-in/testing/TestGoogle";
import {finishSignInRoute} from "@src/router/routes/sign-in/finish/FinishSignInRoute";
import {oauthCookie} from "@src/router/routes/sign-in/start/oauth-cookie/OAuthCookie";
import type {OAuthAttempt} from "@src/router/routes/sign-in/oauth/types/OAuthAttempt";
import type {ApiWorkerEnvironment} from "@src/env/types/ApiWorkerEnvironment";
import {accountOfRequest} from "@src/router/routes/shared/session/AccountOfRequest";
import {subjectDigest} from "@src/router/routes/shared/subject-digest/SubjectDigest";

const NOW = new Date("2026-11-19T12:00:00Z");
const ATTEMPT: OAuthAttempt = {state: "state-1", codeVerifier: "verifier-1", returnTo: "https://gunsmith.test/play"};

describe("a player coming back from Google with the attempt they began", () => {
  beforeEach(() => {
    vi.useFakeTimers({toFake: ["Date"], now: NOW});
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("signs them in and sends them back to the page they came from", async () => {
    testGoogle.behaviour = {subject: "google-sub-1"};

    const response = await finishSignInRoute(callback());

    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toBe("https://gunsmith.test/play");
    const player = await accountOfRequest(withSessionOf(response));
    expect(player?.displayName).toMatch(/^[A-Z][a-z]+ [A-Z][a-z]+$/);
  });

  it("asks Google for the subject with the code, the state returned and the verifier the attempt kept", async () => {
    await finishSignInRoute(callback());

    expect(testGoogle.exchanges).toEqual([
      {
        code: "code-1",
        receivedState: "state-1",
        expectedState: "state-1",
        codeVerifier: "verifier-1",
        redirectUri: "https://gunsmith.test/api/auth/google/callback",
      },
    ]);
  });

  it("gives the account an opaque id of its own, never Google's subject", async () => {
    const sign = vi.spyOn(testAccounts, "findOrCreateAccount");

    testGoogle.behaviour = {subject: "google-sub-1"};
    const response = await finishSignInRoute(callback());

    const [subject, newAccount] = sign.mock.calls[0] ?? [];
    expect(subject).toBe("google-sub-1");
    expect(newAccount?.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(newAccount?.id).not.toContain("google-sub-1");
    expect((await accountOfRequest(withSessionOf(response)))?.id).toBe(newAccount?.id);
  });

  it("gives the same player the same account when they sign in again", async () => {
    testGoogle.behaviour = {subject: "google-sub-1"};

    const first = await finishSignInRoute(callback());
    const second = await finishSignInRoute(callback());

    const firstPlayer = await accountOfRequest(withSessionOf(first));
    const secondPlayer = await accountOfRequest(withSessionOf(second));
    expect(secondPlayer?.id).toBe(firstPlayer?.id);
  });

  it("gives two Google subjects two accounts", async () => {
    testGoogle.behaviour = {subject: "a"};
    const first = await finishSignInRoute(callback());
    testGoogle.behaviour = {subject: "b"};
    const second = await finishSignInRoute(callback());

    const firstPlayer = await accountOfRequest(withSessionOf(first));
    const secondPlayer = await accountOfRequest(withSessionOf(second));
    expect(secondPlayer?.id).not.toBe(firstPlayer?.id);
  });

  it("sets a session cookie good for thirty days, and ends the attempt's", async () => {
    const response = await finishSignInRoute(callback());

    const [session, attempt] = response.headers.getSetCookie();
    expect(session).toMatch(/^session=[A-Za-z0-9_-]{43}; Path=\/; Max-Age=2592000; HttpOnly; Secure; SameSite=Lax$/);
    expect(attempt).toBe("oauth=; Path=/api/auth/google; Max-Age=0; HttpOnly; Secure; SameSite=Lax");
  });

  it("keeps only the hash of the session token, and the session ends in thirty days", async () => {
    const create = vi.spyOn(testAccounts, "createSession");

    const response = await finishSignInRoute(callback());

    const token = response.headers.getSetCookie()[0]?.split(";")[0]?.slice("session=".length) ?? "";
    const [session] = create.mock.calls[0] ?? [];
    expect(session?.idHash).toBe(await sha256Hex(token));
    expect(session?.idHash).not.toContain(token);
    expect(session?.expiresAt).toEqual(new Date(NOW.getTime() + 30 * 24 * 60 * 60 * 1000));
  });

  it("chooses a new token for every sign-in", async () => {
    const first = await finishSignInRoute(callback());
    const second = await finishSignInRoute(callback());

    expect(first.headers.getSetCookie()[0]).not.toBe(second.headers.getSetCookie()[0]);
  });

  it("sends them to the front page when the attempt's return address is not an allowed origin, however it got there", async () => {
    const forged: OAuthAttempt = {...ATTEMPT, returnTo: "https://evil.test/phish"};

    const response = await finishSignInRoute(callback({attempt: forged}));

    expect(response.headers.get("Location")).toBe("/");
  });

  it("tells Google to return to the configured address when there is one", async () => {
    configure({GOOGLE_REDIRECT_URI: "http://localhost:8787/api/auth/google/callback"});
    await finishSignInRoute(callback());

    expect(testGoogle.exchanges[0]?.redirectUri).toBe("http://localhost:8787/api/auth/google/callback");
  });
});

describe("a player whose account was deleted", () => {
  const ONE_DAY = 24 * 60 * 60 * 1000;

  beforeEach(() => {
    vi.useFakeTimers({toFake: ["Date"], now: NOW});
    configure({ACCOUNT_DIGEST_KEY: "test-digest-key"});
    testGoogle.behaviour = {subject: "google-sub-1"};
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("gets the credit id the deleted account had, so deleting did not reset the allowance", async () => {
    const before = await accountOfRequest(withSessionOf(await finishSignInRoute(callback())));
    await testAccounts.removeAccount(before?.id ?? "", {subjectDigest, keepUntil: new Date(NOW.getTime() + ONE_DAY)});

    const after = await accountOfRequest(withSessionOf(await finishSignInRoute(callback())));

    expect(after?.id).toBe(before?.id);
  });

  it("gets the old credit id once only: the record is used up, and the account then keeps its id", async () => {
    const before = await accountOfRequest(withSessionOf(await finishSignInRoute(callback())));
    await testAccounts.removeAccount(before?.id ?? "", {subjectDigest, keepUntil: new Date(NOW.getTime() + ONE_DAY)});
    const claim = vi.spyOn(testAccounts, "claimDeletedAccountId");

    await finishSignInRoute(callback());
    await finishSignInRoute(callback());

    expect(claim.mock.results.length).toBe(2);
    expect(await claim.mock.results[0]?.value).toBe(before?.id);
    expect(await claim.mock.results[1]?.value).toBeUndefined();
  });

  it("gets a fresh id once the time to keep the record has come", async () => {
    const before = await accountOfRequest(withSessionOf(await finishSignInRoute(callback())));
    await testAccounts.removeAccount(before?.id ?? "", {subjectDigest, keepUntil: new Date(NOW.getTime() + ONE_DAY)});
    vi.setSystemTime(new Date(NOW.getTime() + ONE_DAY));

    const after = await accountOfRequest(withSessionOf(await finishSignInRoute(callback())));

    expect(after?.id).not.toBe(before?.id);
  });

  it("does not hand the id to someone else's sign-in", async () => {
    const before = await accountOfRequest(withSessionOf(await finishSignInRoute(callback())));
    await testAccounts.removeAccount(before?.id ?? "", {subjectDigest, keepUntil: new Date(NOW.getTime() + ONE_DAY)});
    testGoogle.behaviour = {subject: "google-sub-2"};

    const other = await accountOfRequest(withSessionOf(await finishSignInRoute(callback())));

    expect(other?.id).not.toBe(before?.id);
  });

  it("asks the keyed digest of the subject, never the subject itself", async () => {
    const claim = vi.spyOn(testAccounts, "claimDeletedAccountId");

    await finishSignInRoute(callback());

    expect(claim).toHaveBeenCalledWith(await subjectDigest("google-sub-1"), NOW);
    expect(claim.mock.calls[0]?.[0]).not.toContain("google-sub-1");
  });

  it("signs in as an ordinary new player, asking nothing, when no digest key is set", async () => {
    Reflect.deleteProperty(workerEnvironment, "ACCOUNT_DIGEST_KEY");
    const claim = vi.spyOn(testAccounts, "claimDeletedAccountId");

    const response = await finishSignInRoute(callback());

    expect(claim).not.toHaveBeenCalled();
    expect(await accountOfRequest(withSessionOf(response))).toBeDefined();
  });

  it("sends them back signed out, rather than with a fresh allowance, when the record cannot be read", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    vi.spyOn(testAccounts, "claimDeletedAccountId").mockRejectedValue(new TypeError("D1 is down"));

    const response = await finishSignInRoute(callback());

    expectSignedOut(response, "https://gunsmith.test/play");
  });
});

describe("a sign-in that does not hold up", () => {
  let warn: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  });

  it("sends them back signed out, with no session, when the state is not the attempt's", async () => {
    const response = await finishSignInRoute(callback({state: "someone-elses"}));

    expectSignedOut(response, "https://gunsmith.test/play");
    expect(testGoogle.exchanges).toEqual([]);
    expect(closedEvent(warn)).toEqual({route: "auth/google/callback", outcome: "state-mismatch"});
  });

  it("sends them back signed out when Google returned no code", async () => {
    const response = await finishSignInRoute(callback({code: ""}));

    expectSignedOut(response, "https://gunsmith.test/play");
    expect(testGoogle.exchanges).toEqual([]);
    expect(closedEvent(warn)).toEqual({route: "auth/google/callback", outcome: "no-code"});
  });

  it("sends them to the front page, signed out, when they bring no attempt", async () => {
    const response = await finishSignInRoute(callback({attempt: undefined}));

    expectSignedOut(response, "/");
    expect(testGoogle.exchanges).toEqual([]);
    expect(closedEvent(warn)).toEqual({route: "auth/google/callback", outcome: "no-attempt"});
  });

  it("sends them to the front page when the attempt cookie is not an attempt", async () => {
    const response = await finishSignInRoute(callback({rawCookie: "oauth=%%%not-base64"}));

    expectSignedOut(response, "/");
  });

  it("sends them back signed out, writing nothing, when Google refuses the code", async () => {
    const create = vi.spyOn(testAccounts, "createSession");
    const find = vi.spyOn(testAccounts, "findOrCreateAccount");

    testGoogle.behaviour = {failsToExchange: true};
    const response = await finishSignInRoute(callback());

    expectSignedOut(response, "https://gunsmith.test/play");
    expect(find).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
    expect(closedEvent(warn)).toEqual({route: "auth/google/callback", outcome: "failed", error: "Error"});
  });

  it("sends them back signed out when the database fails", async () => {
    vi.spyOn(testAccounts, "createSession").mockRejectedValue(new TypeError("D1 is down"));

    const response = await finishSignInRoute(callback());

    expectSignedOut(response, "https://gunsmith.test/play");
    expect(closedEvent(warn)).toEqual({route: "auth/google/callback", outcome: "failed", error: "TypeError"});
  });

  it("sends them back signed out when the Worker has no Google client", async () => {
    Reflect.deleteProperty(workerEnvironment, "GOOGLE_OAUTH_CLIENT_ID");
    const response = await finishSignInRoute(callback());

    expectSignedOut(response, "https://gunsmith.test/play");
  });

  it("logs only the closed event: no code, state, subject, address or cookie", async () => {
    testGoogle.behaviour = {failsToExchange: true, subject: "secret-sub-1"};
    await finishSignInRoute(callback({code: "secret-code-1"}));

    const logged = JSON.stringify(warn.mock.calls);
    for (const secret of ["secret-code-1", "state-1", "verifier-1", "secret-sub-1", "gunsmith.test", "oauth="]) {
      expect(logged).not.toContain(secret);
    }
  });
});

describe("the limiter and the method", () => {
  it("answers 429 and does nothing when the limiter says too many", async () => {
    configure({LOGIN_LIMITER: {limit: async () => ({success: false})}});
    const response = await finishSignInRoute(callback());

    expect(response.status).toBe(429);
    expect(testGoogle.exchanges).toEqual([]);
  });

  it("refuses any way of asking but GET", async () => {
    Reflect.deleteProperty(workerEnvironment, "GOOGLE_OAUTH_CLIENT_ID");
    const response = await finishSignInRoute(
      new Request("https://gunsmith.test/api/auth/google/callback", {method: "POST"}),
    );

    expect(response.status).toBe(405);
    expect(response.headers.get("Allow")).toBe("GET");
  });
});

interface CallbackShape {
  code?: string;
  state?: string;
  attempt?: OAuthAttempt | undefined;
  rawCookie?: string;
}

function callback(shape: CallbackShape = {}): Request {
  const url = new URL("https://gunsmith.test/api/auth/google/callback");
  url.searchParams.set("code", shape.code ?? "code-1");
  url.searchParams.set("state", shape.state ?? "state-1");
  const headers = new Headers();
  const attempt = "attempt" in shape ? shape.attempt : ATTEMPT;
  if (shape.rawCookie) {
    headers.set("Cookie", shape.rawCookie);
  } else if (attempt) {
    headers.set("Cookie", oauthCookie(attempt).split(";")[0] ?? "");
  }

  return new Request(url, {headers});
}

function configure(overrides: Partial<ApiWorkerEnvironment>): void {
  Object.assign(workerEnvironment, overrides);
}

/** A later request carrying the session cookie the response set. */
function withSessionOf(response: Response): Request {
  const session = response.headers.getSetCookie().find(cookie => cookie.startsWith("session="));

  return new Request("https://gunsmith.test/api/me", {headers: {Cookie: session?.split(";")[0] ?? ""}});
}

function expectSignedOut(response: Response, location: string): void {
  expect(response.status).toBe(302);
  expect(response.headers.get("Location")).toBe(location);
  const cookies = response.headers.getSetCookie();
  expect(cookies).toEqual(["oauth=; Path=/api/auth/google; Max-Age=0; HttpOnly; Secure; SameSite=Lax"]);
}

function closedEvent(warn: ReturnType<typeof vi.spyOn>): unknown {
  expect(warn).toHaveBeenCalledTimes(1);

  return JSON.parse(String(warn.mock.calls[0]?.[0]));
}

async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));

  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
}
