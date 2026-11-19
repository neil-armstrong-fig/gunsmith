import {googleRedirectUri} from "@src/router/routes/sign-in/redirect/GoogleRedirectUri";
import type {SignInSettings} from "@src/router/routes/sign-in/types/SignInSettings";

it("is the callback on the address the request came to", () => {
  const request = new Request("https://gunsmith.test/api/auth/google?return=https%3A%2F%2Fgunsmith.test%2F");

  expect(googleRedirectUri(request, settings())).toBe("https://gunsmith.test/api/auth/google/callback");
});

it("keeps the scheme and port of the address it came to", () => {
  expect(googleRedirectUri(new Request("http://localhost:8787/api/auth/google"), settings())).toBe(
    "http://localhost:8787/api/auth/google/callback",
  );
});

it("is the configured address when there is one (behind a dev proxy the Worker sees its own port, not the browser's)", () => {
  const request = new Request("http://127.0.0.1:8788/api/auth/google");

  expect(
    googleRedirectUri(request, settings({GOOGLE_REDIRECT_URI: "http://localhost:8787/api/auth/google/callback"})),
  ).toBe("http://localhost:8787/api/auth/google/callback");
});

function settings(overrides: Partial<SignInSettings> = {}): SignInSettings {
  return {ALLOWED_ORIGINS: "", LOGIN_LIMITER: {limit: async () => ({success: true})}, ...overrides};
}
