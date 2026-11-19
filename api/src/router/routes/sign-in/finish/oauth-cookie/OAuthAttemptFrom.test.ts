import {oauthAttemptFrom} from "@src/router/routes/sign-in/finish/oauth-cookie/OAuthAttemptFrom";
import {oauthCookie} from "@src/router/routes/sign-in/start/oauth-cookie/OAuthCookie";

const ATTEMPT = {state: "state-1", codeVerifier: "verifier-1", returnTo: "https://gunsmith.test/play?x=1&y=é"};

it("reads back the attempt the cookie was made from, even among other cookies", () => {
  const pair = oauthCookie(ATTEMPT).split(";")[0] ?? "";

  expect(oauthAttemptFrom(pair)).toEqual(ATTEMPT);
  expect(oauthAttemptFrom(`theme=dark; ${pair}; session=abc`)).toEqual(ATTEMPT);
});

it("reads back an attempt whose address holds characters beyond Latin-1", () => {
  const attempt = {...ATTEMPT, returnTo: "https://gunsmith.test/play?name=日本語🎯"};

  expect(oauthAttemptFrom(oauthCookie(attempt).split(";")[0] ?? "")).toEqual(attempt);
});

it("finds nothing when the cookie is absent, empty, not base64 or not JSON", () => {
  expect(oauthAttemptFrom(undefined)).toBeUndefined();
  expect(oauthAttemptFrom("")).toBeUndefined();
  expect(oauthAttemptFrom("oauth=")).toBeUndefined();
  expect(oauthAttemptFrom("oauth=%%%")).toBeUndefined();
  expect(oauthAttemptFrom(`oauth=${btoa("not json")}`)).toBeUndefined();
});

it("finds nothing when the JSON is not an attempt (a missing, wrong-typed or non-object field)", () => {
  const cookieOf = (value: unknown): string => `oauth=${btoa(JSON.stringify(value))}`;

  expect(oauthAttemptFrom(cookieOf({state: "s", codeVerifier: "v"}))).toBeUndefined();
  expect(oauthAttemptFrom(cookieOf({state: "s", codeVerifier: "v", returnTo: 3}))).toBeUndefined();
  expect(oauthAttemptFrom(cookieOf(null))).toBeUndefined();
  expect(oauthAttemptFrom(cookieOf("text"))).toBeUndefined();
  expect(oauthAttemptFrom(cookieOf([]))).toBeUndefined();
});

it("does not take a cookie whose name merely ends with oauth", () => {
  const pair = oauthCookie(ATTEMPT).split(";")[0] ?? "";

  expect(oauthAttemptFrom(`not${pair}`)).toBeUndefined();
});
