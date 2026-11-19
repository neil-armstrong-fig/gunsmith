import {clearedOauthCookie} from "@src/router/routes/sign-in/finish/oauth-cookie/ClearedOAuthCookie";
import {oauthCookie} from "@src/router/routes/sign-in/start/oauth-cookie/OAuthCookie";

it("empties the attempt's cookie and expires it at once", () => {
  expect(clearedOauthCookie()).toBe("oauth=; Path=/api/auth/google; Max-Age=0; HttpOnly; Secure; SameSite=Lax");
});

it("names the same cookie, path and attributes the attempt was set with, or the browser would keep the old one", () => {
  const set = oauthCookie({state: "s", codeVerifier: "v", returnTo: "/"});
  const attributes = (cookie: string): string[] =>
    cookie
      .split("; ")
      .slice(1)
      .filter(part => !part.startsWith("Max-Age"));

  expect(clearedOauthCookie().split("=")[0]).toBe(set.split("=")[0]);
  expect(attributes(clearedOauthCookie())).toEqual(attributes(set));
});
