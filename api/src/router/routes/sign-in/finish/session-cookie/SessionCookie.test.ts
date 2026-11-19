import {sessionCookie} from "@src/router/routes/sign-in/finish/session-cookie/SessionCookie";
import {SESSION_LIFETIME_SECONDS} from "@src/router/routes/sign-in/finish/session-cookie/SessionLifetime";

it("signs a player in for thirty days across the whole site, unreadable to scripts, only over a secure same-site request", () => {
  expect(sessionCookie("token-1")).toBe("session=token-1; Path=/; Max-Age=2592000; HttpOnly; Secure; SameSite=Lax");
});

it("lasts as long as the session the database keeps (thirty days)", () => {
  expect(SESSION_LIFETIME_SECONDS).toBe(30 * 24 * 60 * 60);
  expect(sessionCookie("t")).toContain(`Max-Age=${SESSION_LIFETIME_SECONDS};`);
});
