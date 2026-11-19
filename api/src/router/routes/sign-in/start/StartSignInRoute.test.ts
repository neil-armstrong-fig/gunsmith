import {workerEnvironment} from "@src/env/WorkerEnvironment";
import {testGoogle} from "@src/sign-in/testing/TestGoogle";
import {oauthAttemptFrom} from "@src/router/routes/sign-in/finish/oauth-cookie/OAuthAttemptFrom";
import {startSignInRoute} from "@src/router/routes/sign-in/start/StartSignInRoute";
import type {ApiWorkerEnvironment} from "@src/env/types/ApiWorkerEnvironment";

describe("with Google set up and the limiter letting the player in", () => {
  it("sends the player to the address Google's client built, with state and a verifier of the route's own making", async () => {
    const response = await startSignInRoute(start());

    expect(response.status).toBe(302);
    expect(testGoogle.authorizations).toHaveLength(1);
    const [authorization] = testGoogle.authorizations;
    expect(response.headers.get("Location")).toBe(`https://google.test/authorize?state=${authorization?.state}`);
    expect(authorization?.state).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(authorization?.codeVerifier).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(authorization?.state).not.toBe(authorization?.codeVerifier);
  });

  it("chooses a different state and verifier for every attempt", async () => {
    await startSignInRoute(start());
    await startSignInRoute(start());

    expect(testGoogle.authorizations[0]?.state).not.toBe(testGoogle.authorizations[1]?.state);
    expect(testGoogle.authorizations[0]?.codeVerifier).not.toBe(testGoogle.authorizations[1]?.codeVerifier);
  });

  it("keeps the attempt in a short cookie that only the callback's path sees", async () => {
    const response = await startSignInRoute(start("https://gunsmith.test/play"));

    const cookie = response.headers.getSetCookie();
    expect(cookie).toHaveLength(1);
    expect(cookie[0]).toMatch(
      /^oauth=[A-Za-z0-9_-]+; Path=\/api\/auth\/google; Max-Age=600; HttpOnly; Secure; SameSite=Lax$/,
    );
    expect(oauthAttemptFrom(cookie[0])).toEqual({
      state: testGoogle.authorizations[0]?.state,
      codeVerifier: testGoogle.authorizations[0]?.codeVerifier,
      returnTo: "https://gunsmith.test/play",
    });
  });

  it("tells Google to return to the callback on the address it was asked at", async () => {
    await startSignInRoute(start());

    expect(testGoogle.authorizations[0]?.redirectUri).toBe("https://gunsmith.test/api/auth/google/callback");
  });

  it("tells Google to return to the configured address when there is one", async () => {
    configure({GOOGLE_REDIRECT_URI: "http://localhost:8787/api/auth/google/callback"});
    await startSignInRoute(start());

    expect(testGoogle.authorizations[0]?.redirectUri).toBe("http://localhost:8787/api/auth/google/callback");
  });

  it("returns the player to the page that sent them, when it is on an allowed origin", async () => {
    const response = await startSignInRoute(start("https://www.gunsmith.test/room?code=ABC"));

    expect(oauthAttemptFrom(response.headers.getSetCookie()[0])?.returnTo).toBe(
      "https://www.gunsmith.test/room?code=ABC",
    );
  });

  it("returns the player to the front page when the return address is missing or not an allowed origin", async () => {
    const asked = [
      undefined,
      "",
      "https://evil.test/",
      "https://gunsmith.test.evil.test/",
      "https://gunsmith.test@evil.test/",
      "//evil.test/",
      "/play",
      "javascript:alert(1)",
      "not a url",
    ];

    for (const address of asked) {
      const response = await startSignInRoute(start(address));

      expect(oauthAttemptFrom(response.headers.getSetCookie()[0])?.returnTo, String(address)).toBe("/");
    }
  });

  it("returns a local page to itself only when the Worker was started for local use", async () => {
    const local = "http://localhost:3450/play";

    const deployed = await startSignInRoute(start(local));
    configure({ALLOW_LOOPBACK_ORIGINS: "true"});
    const started = await startSignInRoute(start(local));

    expect(oauthAttemptFrom(deployed.headers.getSetCookie()[0])?.returnTo).toBe("/");
    expect(oauthAttemptFrom(started.headers.getSetCookie()[0])?.returnTo).toBe(local);
  });

  it("sends the player back signed out, with no attempt kept, when Google's client cannot build the address", async () => {
    testGoogle.behaviour = {failsToSendThePlayer: true};
    const response = await startSignInRoute(start("https://gunsmith.test/play"));

    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toBe("https://gunsmith.test/play");
    expect(response.headers.getSetCookie()).toEqual([]);
  });

  it("refuses any way of asking but GET", async () => {
    const response = await startSignInRoute(new Request("https://gunsmith.test/api/auth/google", {method: "POST"}));

    expect(response.status).toBe(405);
    expect(response.headers.get("Allow")).toBe("GET");
  });
});

describe("with Google not set up", () => {
  it("sends the player back where they came from, signed out, with nothing kept", async () => {
    Reflect.deleteProperty(workerEnvironment, "GOOGLE_OAUTH_CLIENT_ID");
    const response = await startSignInRoute(start("https://gunsmith.test/play"));

    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toBe("https://gunsmith.test/play");
    expect(response.headers.getSetCookie()).toEqual([]);
  });

  it("sends a player with no usable return address to the front page", async () => {
    Reflect.deleteProperty(workerEnvironment, "GOOGLE_OAUTH_CLIENT_ID");
    const response = await startSignInRoute(start("https://evil.test/"));

    expect(response.headers.get("Location")).toBe("/");
  });
});

describe("with the limiter", () => {
  it("answers 429 and does not start an attempt when the limiter says too many", async () => {
    configure({LOGIN_LIMITER: limiter({allowed: false})});
    const response = await startSignInRoute(start());

    expect(response.status).toBe(429);
    expect(testGoogle.authorizations).toEqual([]);
    expect(response.headers.getSetCookie()).toEqual([]);
  });

  it("counts attempts by the address Cloudflare saw", async () => {
    const keys: string[] = [];

    configure({LOGIN_LIMITER: limiter({allowed: true, keys})});
    await startSignInRoute(start(undefined, {"CF-Connecting-IP": "203.0.113.9"}));

    expect(keys).toEqual(["203.0.113.9"]);
  });

  it("lets the player in when the limiter itself fails", async () => {
    configure({LOGIN_LIMITER: limiter({fails: true})});
    const response = await startSignInRoute(start());

    expect(response.status).toBe(302);
    expect(testGoogle.authorizations).toHaveLength(1);
  });
});

function start(returnTo?: string, headers: Record<string, string> = {}): Request {
  const url = new URL("https://gunsmith.test/api/auth/google");
  if (returnTo !== undefined) {
    url.searchParams.set("return", returnTo);
  }

  return new Request(url, {headers});
}

function configure(overrides: Partial<ApiWorkerEnvironment>): void {
  Object.assign(workerEnvironment, overrides);
}

interface LimiterShape {
  allowed?: boolean;
  fails?: boolean;
  keys?: string[];
}

function limiter({allowed = true, fails = false, keys = []}: LimiterShape): RateLimit {
  return {
    limit: async ({key}) => {
      keys.push(key);
      if (fails) {
        throw new Error("the limiter is down");
      }

      return {success: allowed};
    },
  };
}
