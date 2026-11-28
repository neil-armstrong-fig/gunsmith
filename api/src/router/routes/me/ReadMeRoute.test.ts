import {testAccounts} from "@src/shared/accounts/testing/in-memory/TestAccounts";
import {readMeRoute} from "@src/router/routes/me/ReadMeRoute";
import {signInPlayer} from "@src/router/routes/shared/fake-accounts/SignInPlayer";

it("says the visitor is signed out when there is no session cookie, without asking the store", async () => {
  const lookup = vi.spyOn(testAccounts, "accountOfSession");

  const response = await readMeRoute(get());

  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({signedIn: false});
  expect(lookup).not.toHaveBeenCalled();
});

it("says who is signed in, by display name only", async () => {
  const player = await signInPlayer({displayName: "Quiet Falcon"});

  const response = await readMeRoute(get(player.cookie));

  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({signedIn: true, displayName: "Quiet Falcon"});
  expect(response.headers.get("Cache-Control")).toBe("private, no-store");
});

it("says signed out for a session cookie nobody holds", async () => {
  await signInPlayer();

  const response = await readMeRoute(get("session=not-a-token-we-gave"));

  expect(await response.json()).toEqual({signedIn: false});
});

it("says signed out once the session has expired", async () => {
  const player = await signInPlayer({expiresAt: new Date(Date.now() - 1000)});

  const response = await readMeRoute(get(player.cookie));

  expect(await response.json()).toEqual({signedIn: false});
});

it("says signed out when the Worker has no account store", async () => {
  const response = await readMeRoute(get("session=anything"));

  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({signedIn: false});
});

it("refuses any way of asking but GET", async () => {
  const response = await readMeRoute(new Request("https://gunsmith.test/api/me", {method: "POST"}));

  expect(response.status).toBe(405);
  expect(response.headers.get("Allow")).toBe("GET");
});

function get(cookie?: string): Request {
  const headers = new Headers();
  if (cookie) {
    headers.set("Cookie", cookie);
  }

  return new Request("https://gunsmith.test/api/me", {headers});
}
