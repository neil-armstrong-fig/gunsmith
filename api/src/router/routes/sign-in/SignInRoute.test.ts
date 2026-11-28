import {signInRoute} from "@src/router/routes/sign-in/SignInRoute";
import {testGoogle} from "@src/router/routes/sign-in/google/testing/TestGoogle";

it("starts a sign-in for a request to the sign-in address", async () => {
  const response = await signInRoute(
    new Request("https://gunsmith.test/api/auth/google?return=https%3A%2F%2Fgunsmith.test%2F"),
  );

  expect(response.status).toBe(302);
  expect(response.headers.get("Location")).toContain("https://google.test/authorize");
  expect(testGoogle.authorizations).toHaveLength(1);
  expect(response.headers.getSetCookie()[0]).toMatch(/^oauth=/);
});

it("finishes one for a request to the callback address, sending a player with no attempt back signed out", async () => {
  const response = await signInRoute(new Request("https://gunsmith.test/api/auth/google/callback?code=c&state=s"));

  expect(response.status).toBe(302);
  expect(response.headers.get("Location")).toBe("/");
  expect(response.headers.getSetCookie()).toEqual([
    "oauth=; Path=/api/auth/google; Max-Age=0; HttpOnly; Secure; SameSite=Lax",
  ]);
  expect(testGoogle.authorizations).toEqual([]);
});
