import {testAccounts} from "@src/shared/accounts/testing/in-memory/TestAccounts";
import {logOutRoute} from "@src/router/routes/log-out/LogOutRoute";
import {signInPlayer} from "@src/router/routes/shared/fake-accounts/SignInPlayer";
import {accountOfRequest} from "@src/router/routes/shared/session/AccountOfRequest";

const CLEARED = "session=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax";

it("ends the session in the store and clears the cookie in the browser", async () => {
  const player = await signInPlayer();

  const response = await logOutRoute(post(player.cookie));

  expect(response.status).toBe(204);
  expect(response.headers.getSetCookie()).toEqual([CLEARED]);
  expect(await accountOfRequest(post(player.cookie))).toBeUndefined();
});

it("ends only that session, leaving the same player's other sign-ins", async () => {
  const here = await signInPlayer();
  const elsewhere = await signInPlayer();

  await logOutRoute(post(here.cookie));

  expect(await accountOfRequest(post(elsewhere.cookie))).toEqual(elsewhere.account);
});

it("succeeds, and clears the cookie, for someone who is not signed in", async () => {
  const deletion = vi.spyOn(testAccounts, "deleteSession");

  const response = await logOutRoute(post());

  expect(response.status).toBe(204);
  expect(response.headers.getSetCookie()).toEqual([CLEARED]);
  expect(deletion).not.toHaveBeenCalled();
});

it("answers 500 but still clears the cookie when the store cannot end the session", async () => {
  vi.spyOn(testAccounts, "deleteSession").mockRejectedValue(new TypeError("D1 is down"));
  const player = await signInPlayer();

  const response = await logOutRoute(post(player.cookie));

  expect(response.status).toBe(500);
  expect(await response.json()).toEqual({error: "sign-out-failed"});
  expect(response.headers.getSetCookie()).toEqual([CLEARED]);
});

it("refuses any way of asking but POST", async () => {
  const response = await logOutRoute(new Request("https://gunsmith.test/api/auth/logout"));

  expect(response.status).toBe(405);
  expect(response.headers.get("Allow")).toBe("POST");
});

function post(cookie?: string): Request {
  const headers = new Headers();
  if (cookie) {
    headers.set("Cookie", cookie);
  }

  return new Request("https://gunsmith.test/api/auth/logout", {method: "POST", headers});
}
