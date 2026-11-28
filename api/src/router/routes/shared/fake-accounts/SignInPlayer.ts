import {createSession} from "@src/shared/accounts/create-session/CreateSession";
import {findOrCreateAccount} from "@src/shared/accounts/find-or-create-account/FindOrCreateAccount";
import type {Account} from "@src/shared/accounts/types/Account";
import {hashSessionToken} from "@src/router/routes/shared/session/HashSessionToken";
import {randomToken} from "@src/router/routes/shared/session/RandomToken";
import {SESSION_COOKIE_NAME} from "@src/router/routes/shared/session/SessionCookieName";
import type {SignedInPlayer} from "@src/router/routes/shared/fake-accounts/types/SignedInPlayer";
import type {SignInPlayerOptions} from "@src/router/routes/shared/fake-accounts/types/SignInPlayerOptions";

const A_MONTH_MILLISECONDS = 30 * 24 * 60 * 60 * 1000;

/** For a route's test: a new account (in the in-memory accounts every test is given) with a live session (unless `expiresAt` says otherwise), and the cookie that proves it. */
export async function signInPlayer(options: SignInPlayerOptions = {}): Promise<SignedInPlayer> {
  const id = crypto.randomUUID();
  const account: Account = await findOrCreateAccount(`google-${id}`, {
    id,
    displayName: options.displayName ?? "Test Player",
    now: new Date(),
  });
  const token = randomToken();
  await createSession({
    idHash: await hashSessionToken(token),
    userId: account.id,
    expiresAt: options.expiresAt ?? new Date(Date.now() + A_MONTH_MILLISECONDS),
  });

  return {account, cookie: `${SESSION_COOKIE_NAME}=${token}`};
}
