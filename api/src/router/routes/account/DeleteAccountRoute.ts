import {removeAccount} from "@src/accounts/remove-account/RemoveAccount";
import {eraseExpiredCredits} from "@src/account-retention/EraseExpiredCredits";
import {DELETED_ACCOUNT_RETENTION_DAYS} from "@src/router/routes/account/retention/DeletedAccountRetention";
import {accountOfRequest} from "@src/router/routes/shared/session/AccountOfRequest";
import {clearedSessionCookie} from "@src/router/routes/shared/session/ClearedSessionCookie";
import {isSubjectDigestConfigured} from "@src/router/routes/shared/subject-digest/IsSubjectDigestConfigured";
import {subjectDigest} from "@src/router/routes/shared/subject-digest/SubjectDigest";

const A_DAY_MILLISECONDS = 24 * 60 * 60 * 1000;

/**
 * `DELETE /api/account` from a signed-in player: removes the account in the database (its sessions and kept items go with it by
 * `ON DELETE cascade`, so no new signed-in request can start) and answers 204 with the session cookie cleared. A request with no live
 * session is 401, never a 204: there is nothing to delete.
 *
 * **It does not give the player a fresh allowance.** The credit ledger is **not** erased: the database keeps, for
 * `DELETED_ACCOUNT_RETENTION_DAYS` only, the keyed digest of the player's Google subject beside the opaque id the ledger holds their
 * credits under, and signing in again within that time gives the new account the same id (`router/routes/sign-in/finish/`). Otherwise
 * delete-and-sign-in would reset the daily credits, and the spend behind them, on demand. What is kept is described in
 * `docs/privacy-and-data.md`. After the time the record is swept and its ledger erased by the daily Worker schedule
 * or by another account deletion.
 *
 * - No `ACCOUNT_DIGEST_KEY`: 503 `deletion-unavailable`, nothing removed (the record could not be made, and removing without it would
 *   reopen the reset).
 * - The database cannot remove the account: 500 `account-deletion-failed`, the session and cookie kept so the player can ask again.
 * - A ledger that cannot be erased after the sweep: still 204; one closed-event `console.warn` (the error's class alone) for someone to
 *   sweep, since what stays is an opaque-id record with no link to a person any more.
 */
export async function deleteAccountRoute(request: Request): Promise<Response> {
  if (request.method !== "DELETE") {
    return Response.json({error: "method-not-allowed"}, {status: 405, headers: {Allow: "DELETE"}});
  }

  const account = await accountOfRequest(request);
  if (!account) {
    return Response.json({error: "account-required"}, {status: 401});
  }
  if (!isSubjectDigestConfigured()) {
    return Response.json({error: "deletion-unavailable"}, {status: 503});
  }

  const now = new Date();
  try {
    await removeAccount(account.id, {
      subjectDigest,
      keepUntil: new Date(now.getTime() + DELETED_ACCOUNT_RETENTION_DAYS * A_DAY_MILLISECONDS),
    });
  } catch {
    return Response.json({error: "account-deletion-failed"}, {status: 500});
  }

  await eraseExpiredCredits(now);

  return new Response(null, {status: 204, headers: {"Set-Cookie": clearedSessionCookie()}});
}
