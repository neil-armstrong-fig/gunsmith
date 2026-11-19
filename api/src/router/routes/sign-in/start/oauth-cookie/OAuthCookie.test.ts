import {oauthCookie} from "@src/router/routes/sign-in/start/oauth-cookie/OAuthCookie";

const ATTEMPT = {state: "state-1", codeVerifier: "verifier-1", returnTo: "https://gunsmith.test/play"};

it("keeps the attempt for ten minutes, for the sign-in path alone, where no script can read it and only a return trip from Google carries it", () => {
  expect(oauthCookie(ATTEMPT)).toMatch(
    /^oauth=[A-Za-z0-9_-]+; Path=\/api\/auth\/google; Max-Age=600; HttpOnly; Secure; SameSite=Lax$/,
  );
});

it("holds the attempt as unpadded base64url of its JSON, so nothing in the value needs quoting, whatever its length", () => {
  for (const tail of ["", "a", "ab", "abc", "abcd"]) {
    const attempt = {...ATTEMPT, returnTo: `https://gunsmith.test/a?b=c&d=é${tail}`};
    const value = oauthCookie(attempt).split(";")[0]?.slice("oauth=".length) ?? "";

    expect(value, tail).not.toMatch(/[+/=;, ]/);
    const bytes = Uint8Array.from(atob(value.replaceAll("-", "+").replaceAll("_", "/")), character =>
      character.charCodeAt(0),
    );
    expect(JSON.parse(new TextDecoder().decode(bytes))).toEqual(attempt);
  }
});

it("makes a different cookie for a different attempt", () => {
  expect(oauthCookie(ATTEMPT)).not.toBe(oauthCookie({...ATTEMPT, state: "state-2"}));
});
