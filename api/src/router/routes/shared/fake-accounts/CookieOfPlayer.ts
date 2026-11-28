import {createSession} from "@src/shared/accounts/create-session/CreateSession";
import {findOrCreateAccount} from "@src/shared/accounts/find-or-create-account/FindOrCreateAccount";
import {createHash} from "node:crypto";

/**
 * For a route's test: the `Cookie` header of the player called `accountId` (the id the ledgers know them by), signed in again each call
 * (idempotent). Synchronous, so a request can be built in one expression: the in-memory account functions finish before their first
 * `await`, so the account and its session exist as soon as this returns.
 */
export function cookieOfPlayer(accountId: string): string {
  const token = `token-of-${accountId}`;
  void findOrCreateAccount(`google-${accountId}`, {id: accountId, displayName: "Test Player", now: new Date()});
  void createSession({
    idHash: createHash("sha256").update(token).digest("hex"),
    userId: accountId,
    expiresAt: new Date("2100-01-01T00:00:00Z"),
  });

  return `session=${token}`;
}
