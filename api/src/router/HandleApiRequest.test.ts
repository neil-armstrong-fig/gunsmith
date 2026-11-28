import {workerEnvironment} from "@src/shared/env/WorkerEnvironment";
import {isArenaPipelineAvailable} from "@src/router/routes/arenas/pipeline/IsArenaPipelineAvailable";
import {isWeaponPipelineAvailable} from "@src/router/routes/weapons/pipeline/IsWeaponPipelineAvailable";
import {handleApiRequest} from "@src/router/HandleApiRequest";
import {signInPlayer} from "@src/router/routes/shared/fake-accounts/SignInPlayer";
import {fakeLedgers} from "@src/router/routes/shared/fake-ledgers/FakeLedgers";
import {testGoogle} from "@src/router/routes/sign-in/google/testing/TestGoogle";
import {oauthCookie} from "@src/router/routes/sign-in/start/oauth-cookie/OAuthCookie";

it("allows the webapp's credentialed request to the API hostname", async () => {
  const player = await signInPlayer({displayName: "Quiet Falcon"});
  const response = await handleApiRequest(
    new Request("https://api.gunsmith.test/api/me", {headers: {...FROM_THE_SITE, Cookie: player.cookie}}),
  );

  expect(response.headers.get("Access-Control-Allow-Origin")).toBe(FROM_THE_SITE.Origin);
  expect(response.headers.get("Access-Control-Allow-Credentials")).toBe("true");
  expect(response.headers.get("Vary")).toBe("Origin");
  expect(await response.json()).toEqual({signedIn: true, displayName: "Quiet Falcon"});
});

it("allows the webapp to cache a JSON preflight", async () => {
  const response = await handleApiRequest(
    new Request("https://api.gunsmith.test/api/library", {
      method: "OPTIONS",
      headers: {
        ...FROM_THE_SITE,
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type",
      },
    }),
  );

  expect(response.status).toBe(204);
  expect(response.headers.get("Access-Control-Allow-Origin")).toBe(FROM_THE_SITE.Origin);
  expect(response.headers.get("Access-Control-Allow-Credentials")).toBe("true");
  expect(response.headers.get("Access-Control-Allow-Methods")).toContain("POST");
  expect(response.headers.get("Access-Control-Allow-Headers")).toBe("Content-Type");
  expect(response.headers.get("Access-Control-Max-Age")).toBe("7200");
});

it("withholds CORS permission from an untrusted origin", async () => {
  const response = await handleApiRequest(
    new Request("https://api.gunsmith.test/api/library", {
      method: "OPTIONS",
      headers: {Origin: "https://gunsmith.test.evil.test", "Access-Control-Request-Method": "POST"},
    }),
  );

  expect(response.headers.get("Access-Control-Allow-Origin")).toBeNull();
  expect(response.headers.get("Access-Control-Allow-Credentials")).toBeNull();
});

it("hands a room request to the room route", async () => {
  const response = await handleApiRequest(
    new Request("https://gunsmith.test/api/rooms", {method: "POST", headers: FROM_THE_SITE}),
  );

  expect(response.status).toBe(201);
});

it("hands a socket request to the socket route, with the code in the path", async () => {
  const names: string[] = [];
  useMatches(names);
  const response = await handleApiRequest(upgrade("/api/rooms/ABC234/socket"));

  expect(await response.text()).toBe("the match");
  expect(names).toEqual(["ABC234"]);
});

it("hands a weapon request to the generation route, which asks for a signed-in player", async () => {
  const response = await handleApiRequest(weaponRequest());

  expect(response.status).toBe(401);
  expect(await response.json()).toEqual({error: "account-required"});
});

it("answers a weapon request ai-unavailable while the Worker has no weapon pipeline", async () => {
  vi.mocked(isWeaponPipelineAvailable).mockReturnValue(false);

  const response = await handleApiRequest(weaponRequest());

  expect(response.status).toBe(503);
  expect(await response.json()).toEqual({error: "ai-unavailable"});
});

it("refuses any way of asking for a weapon but POST", async () => {
  const response = await handleApiRequest(new Request("https://gunsmith.test/api/weapons"));

  expect(response.status).toBe(405);
  expect(response.headers.get("Allow")).toBe("POST");
});

it("hands an arena request to its own generation route, which asks for a signed-in player", async () => {
  const response = await handleApiRequest(arenaRequest());

  expect(response.status).toBe(401);
  expect(await response.json()).toEqual({error: "account-required"});
});

it("answers an arena request ai-unavailable when only the weapon pipeline exists", async () => {
  vi.mocked(isArenaPipelineAvailable).mockReturnValue(false);

  const response = await handleApiRequest(arenaRequest());

  expect(response.status).toBe(503);
  expect(await response.json()).toEqual({error: "ai-unavailable"});
});

it("answers a weapon request ai-unavailable when only the arena pipeline exists", async () => {
  vi.mocked(isWeaponPipelineAvailable).mockReturnValue(false);

  const response = await handleApiRequest(weaponRequest());

  expect(response.status).toBe(503);
  expect(await response.json()).toEqual({error: "ai-unavailable"});
});

it("refuses any way of asking for an arena but POST", async () => {
  const response = await handleApiRequest(new Request("https://gunsmith.test/api/arenas"));

  expect(response.status).toBe(405);
  expect(response.headers.get("Allow")).toBe("POST");
});

it("hands the shelf and an item's path to the library route", async () => {
  const shelf = await handleApiRequest(new Request("https://gunsmith.test/api/library"));
  const item = await handleApiRequest(
    new Request("https://gunsmith.test/api/library/arena-1", {method: "GET", headers: FROM_THE_SITE}),
  );

  expect(shelf.status).toBe(401);
  expect(await shelf.json()).toEqual({error: "account-required"});
  expect(item.status).toBe(405);
  expect(item.headers.get("Allow")).toBe("DELETE");
});

it("hands a credits request to the credit status route", async () => {
  const withoutAccount = await handleApiRequest(new Request("https://gunsmith.test/api/credits"));
  const wrongMethod = await handleApiRequest(
    new Request("https://gunsmith.test/api/credits", {method: "POST", headers: FROM_THE_SITE}),
  );

  expect(withoutAccount.status).toBe(401);
  expect(await withoutAccount.json()).toEqual({error: "account-required"});
  expect(wrongMethod.status).toBe(405);
  expect(wrongMethod.headers.get("Allow")).toBe("GET");
});

it("hands a me request to the me route, with the account store it was given", async () => {
  const player = await signInPlayer({displayName: "Quiet Falcon"});
  const request = new Request("https://gunsmith.test/api/me", {headers: {Cookie: player.cookie}});

  const signedIn = await handleApiRequest(request);
  const guest = await handleApiRequest(new Request("https://gunsmith.test/api/me"));

  expect(await signedIn.json()).toEqual({signedIn: true, displayName: "Quiet Falcon"});
  expect(await guest.json()).toEqual({signedIn: false});
});

it("hands a sign-in start request to the start route, with the Google client it was given", async () => {
  const response = await handleApiRequest(
    new Request("https://gunsmith.test/api/auth/google?return=https%3A%2F%2Fgunsmith.test%2Fplay"),
  );

  expect(response.status).toBe(302);
  expect(response.headers.get("Location")).toContain("https://google.test/authorize");
  expect(testGoogle.authorizations).toHaveLength(1);
});

it("hands a sign-in callback to the finish route, and the player is then signed in", async () => {
  const attempt = oauthCookie({state: "s", codeVerifier: "v", returnTo: "https://gunsmith.test/play"});
  const callback = new Request("https://gunsmith.test/api/auth/google/callback?code=c&state=s", {
    headers: {Cookie: attempt.split(";")[0] ?? ""},
  });

  const finished = await handleApiRequest(callback);
  const session = finished.headers.getSetCookie().find(cookie => cookie.startsWith("session="));
  const me = await handleApiRequest(
    new Request("https://gunsmith.test/api/me", {headers: {Cookie: session?.split(";")[0] ?? ""}}),
  );

  expect(finished.headers.get("Location")).toBe("https://gunsmith.test/play");
  expect(await me.json()).toMatchObject({signedIn: true});
});

it("hands a logout to the log-out route, and the player is then signed out", async () => {
  const player = await signInPlayer();
  const me = (): Request => new Request("https://gunsmith.test/api/me", {headers: {Cookie: player.cookie}});

  const loggedOut = await handleApiRequest(
    new Request("https://gunsmith.test/api/auth/logout", {
      method: "POST",
      headers: {...FROM_THE_SITE, Cookie: player.cookie},
    }),
  );
  const after = await handleApiRequest(me());

  expect(loggedOut.status).toBe(204);
  expect(await after.json()).toEqual({signedIn: false});
});

it("turns away a logout from a page that is not the site", async () => {
  const response = await handleApiRequest(
    new Request("https://gunsmith.test/api/auth/logout", {method: "POST", headers: {Origin: "https://evil.test"}}),
  );

  expect(response.status).toBe(403);
});

it("hands an account deletion to the account route, and the player is then signed out", async () => {
  fakeLedgers();
  workerEnvironment.ACCOUNT_DIGEST_KEY = "test-digest-key";
  const player = await signInPlayer();

  const deleted = await handleApiRequest(
    new Request("https://gunsmith.test/api/account", {
      method: "DELETE",
      headers: {...FROM_THE_SITE, Cookie: player.cookie},
    }),
  );
  const after = await handleApiRequest(new Request("https://gunsmith.test/api/me", {headers: {Cookie: player.cookie}}));

  expect(deleted.status).toBe(204);
  expect(await after.json()).toEqual({signedIn: false});
});

it("turns away an account deletion from a page that is not the site, and deletes nothing", async () => {
  const player = await signInPlayer();

  const response = await handleApiRequest(
    new Request("https://gunsmith.test/api/account", {
      method: "DELETE",
      headers: {Origin: "https://evil.test", Cookie: player.cookie},
    }),
  );
  const after = await handleApiRequest(new Request("https://gunsmith.test/api/me", {headers: {Cookie: player.cookie}}));

  expect(response.status).toBe(403);
  expect(await after.json()).toMatchObject({signedIn: true});
});

it("turns away a state-changing request from a page that is not the site, before any route answers", async () => {
  const response = await handleApiRequest(
    new Request("https://gunsmith.test/api/rooms", {method: "POST", headers: {Origin: "https://evil.test"}}),
  );

  expect(response.status).toBe(403);
  expect(await response.json()).toEqual({error: "forbidden-origin"});
});

it("answers 404 to any other path", async () => {
  const response = await handleApiRequest(new Request("https://gunsmith.test/api/elsewhere"));

  expect(response.status).toBe(404);
});

const FROM_THE_SITE = {Origin: "https://gunsmith.test"};

/** The room objects a socket request reaches: every one answers 200 and remembers which name asked. */
function useMatches(names: string[]): void {
  workerEnvironment.MATCHES = matchesThatAnswer(names);
}

/** A `MATCHES` namespace whose every object answers 101 and remembers which name asked. */
function matchesThatAnswer(names: string[]): DurableObjectNamespace {
  const namespace = {
    idFromName: (name: string): string => name,
    get: (id: string): DurableObjectStub => {
      names.push(id);

      return {fetch: async () => new Response("the match", {status: 200})} as unknown as DurableObjectStub;
    },
  };

  return namespace as unknown as DurableObjectNamespace;
}

function upgrade(path: string): Request {
  return new Request(`https://gunsmith.test${path}`, {headers: {Upgrade: "websocket", ...FROM_THE_SITE}});
}

/** A weapon request with no account id, so the route turns it away before it asks any ledger. */
function weaponRequest(): Request {
  return new Request("https://gunsmith.test/api/weapons", {
    method: "POST",
    headers: FROM_THE_SITE,
    body: JSON.stringify({prompt: "a rifle"}),
  });
}

/** An arena request with no account id, so the route turns it away before it asks any ledger. */
function arenaRequest(): Request {
  return new Request("https://gunsmith.test/api/arenas", {
    method: "POST",
    headers: FROM_THE_SITE,
    body: JSON.stringify({prompt: "a maze"}),
  });
}
