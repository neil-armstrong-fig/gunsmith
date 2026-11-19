import fc from "fast-check";
import {signInPlayer} from "@src/router/routes/shared/fake-accounts/SignInPlayer";
import {accountOfRequest} from "@src/router/routes/shared/session/AccountOfRequest";
import {randomToken} from "@src/router/routes/shared/session/RandomToken";

/**
 * What must hold for whatever `Cookie` header a request carries: it is somebody only if it carries a session token the store holds,
 * live, in full (so no guess, prefix or other cookie opens an account), and it never throws. Deliberately outside `pnpm checks` (a
 * fresh seed each run); `pnpm test:properties` runs it.
 */
const RUNS = Number(process.env["PROPERTY_TEST_RUNS"] ?? 100);

it("knows a request's player only by a whole live token, for any other cookie header", async () => {
  await fc.assert(
    fc.asyncProperty(fc.integer({min: 1, max: 4}), fc.string(), async (playerCount, junk) => {
      const players = await Promise.all(Array.from({length: playerCount}, () => signInPlayer()));

      for (const player of players) {
        expect(await accountOfRequest(withCookie(player.cookie))).toEqual(player.account);
        expect(await accountOfRequest(withCookie(`${player.cookie}x`))).toBeUndefined();
        expect(await accountOfRequest(withCookie(player.cookie.slice(0, -1)))).toBeUndefined();
        expect(await accountOfRequest(withCookie(`other=${junk}; ${player.cookie}`))).toEqual(player.account);
      }
      expect(await accountOfRequest(withCookie(`session=${randomToken()}`))).toBeUndefined();
      expect(await accountOfRequest(withCookie(junk))).toBeUndefined();
    }),
    {numRuns: RUNS},
  );
});

it("knows nobody once their session has expired, however long ago", async () => {
  await fc.assert(
    fc.asyncProperty(fc.integer({min: 1, max: 10 * 365 * 24 * 3600}), async secondsAgo => {
      const player = await signInPlayer({expiresAt: new Date(Date.now() - secondsAgo * 1000)});

      expect(await accountOfRequest(withCookie(player.cookie))).toBeUndefined();
    }),
    {numRuns: RUNS},
  );
});

function withCookie(cookie: string): Request {
  return new Request("https://gunsmith.test/api/me", {headers: {Cookie: cookie.replaceAll(/[\n\r\0]/g, " ")}});
}
