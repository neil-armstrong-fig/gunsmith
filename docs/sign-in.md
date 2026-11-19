# Sign-in

**Status: built 2026-11-19 (server), including `DELETE /api/account`, which keeps a keyed digest for 90 days so deleting does not reset the daily allowance (the user's rule, 2026-11-19).** The design copies janggi's `api/` (`~/Development/Personal/janggi/api`), which already ships it. The user approved the three pins below on 2026-11-19 and they are in the catalog.

## Why now

Sign-in gates the production generation path. While the account id was the unauthenticated `X-Account-Id` header, anyone could spend another player's credits, or send a fresh id per request for ten free credits each, so no production `WeaponSmith` or `ArenaSmith` could be wired. The header is **deleted** and the credit routes read the session. Library limits and `DELETE /api/account` need a real account too. Guests keep practice and private rooms ([privacy](privacy-and-data.md)).

## The flow

The API router hands both Google URLs to `SignInRoute.ts`, which dispatches to the start or callback handler.

- `GET /api/auth/google?return=` sends the player to Google: code flow with PKCE (S256), scope `openid` only, a random `state`. The attempt (state, verifier, checked return address) rides in a short cookie: `HttpOnly; Secure; SameSite=Lax`, path `/api/auth/google`, ten minutes.
- `GET /api/auth/google/callback` compares the cookie's state, exchanges the code with `oauth4webapi` (it checks issuer, audience and expiry; the ID token's signature is not re-checked, which OpenID Connect allows for a token received straight from the token endpoint over TLS), reads `sub`, finds or creates the account and sets the session. **Any failure redirects back signed out**; there is no error page.
- A **session** is a 256-bit random token in an `HttpOnly; Secure; SameSite=Lax` cookie for 30 days. D1 keeps only `sha256(token)`, so a leaked table cannot be replayed as cookies.
- `POST /api/auth/logout` ends it and succeeds with none. `GET /api/me` is **always 200** `{signedIn, displayName?}` (never a 401, so a guest's page logs nothing for asking) and does not touch D1 when there is no cookie. `DELETE /api/account` removes the user, its sessions and kept items and answers 204 with the cookie cleared (401 with no session; 503 with no `ACCOUNT_DIGEST_KEY`; 500 and nothing cleared if D1 fails). **It does not erase the credit ledger and does not reset the allowance:** it keeps, for 90 days (`DELETED_ACCOUNT_RETENTION_DAYS`), the keyed HMAC of the Google subject beside the ledger's opaque id (`deleted_accounts`), and signing in again within that time gives the new account the same id and so the same balance. After 90 days the record is swept and the ledger erased. See [privacy](privacy-and-data.md).

## Decisions

1. **The account id is an opaque `crypto.randomUUID()`**, never the Google `sub` or a name. It is the `CREDITS.getByName(accountId)` name. `routes/shared/session/AccountOfRequest` reads the session; **`X-Account-Id` and `ParseAccountId` are deleted, with no back door** (a test sends the header and is refused). The weapon, arena and credit routes changed in the one shared guard.
2. **Same origin, so no CORS.** Two cheap guards: the `Origin` check on **every state-changing request and on the WebSocket upgrade** (a missing `Origin` is refused; reads and the OAuth callback are not asked), and the return address checked **by whole origin, never by prefix** (an open redirect would let any page use the sign-in to send someone on). Trusted origins are `ALLOWED_ORIGINS` (the site) plus, **only where a local start script passed `ALLOW_LOOPBACK_ORIGINS=true`**, a plain-http localhost or 127.0.0.1 page at any port (the user's choice, so no port list goes stale as each session uses its own). `pnpm api:dev` and the managed acceptance Worker pass the flag; `wrangler.jsonc` and `infra/` never declare it, so a deployed Worker cannot have it.
3. **Guests are unchanged.** Rooms and practice need no session. Sign-in is required for generation, credits, the library and the later public queue. A signed-in account is not put into a room yet.
4. **D1 with Drizzle, in `api/src/accounts/` alone** (ESLint refuses `drizzle-orm` anywhere else, and `oauth4webapi` outside `sign-in/`; code reaches the Worker's bindings only through `env/WorkerEnvironment`, the one file that imports `cloudflare:workers`). Tables now: `users` (`id`, unique `google_sub`, `display_name`, `created_at`) and `sessions` (`id_hash` primary key, `user_id` cascading, `expires_at`). No email and no real name. `drizzle-kit generate --name=<change>` writes the SQL, which is inspected; **Wrangler applies it** (never `drizzle-kit migrate` or `push` too). **One migration until release** (the user's rule): a schema change regenerates it and the disposable local D1 is rebuilt; separate files start at release. Library, ratings and history tables arrive with their own slices.
5. **Rate limit:** a Cloudflare Rate Limiting binding `LOGIN_LIMITER`, 10 a minute per address, on both the start and the callback. A failing binding lets the request through.
6. **Logs hold closed events only** (route, outcome, error class), never a cookie, an account id or a URL ([privacy](privacy-and-data.md)). Today one `console.warn` per failed sign-in.

## How it is tested

Three ways, each where it is cheapest.

- Routes against in-memory accounts and a fake Google, swapped in by **`vi.mock` in one setup file** (`api/src/testing/SetupApiTests.ts`, janggi's model, the user's choice 2026-11-19: routes import plain functions and singletons, nothing is injected). The setup clears every `workerEnvironment` key after each test.
- Each account function (`api/src/accounts/<function>/`) has a unit test beside it that runs the real function on a real local D1 with raw SQL for what it arranges and asserts; one contract (`accounts/testing/contract/AccountsContract`) that the in-memory functions and the real ones both pass keeps the stand-in honest, so the two cannot differ. It runs in plain node through wrangler's `getPlatformProxy({persist: false})`, applying `migrations/*.sql`; there is no workers pool.
- `googleSubjectOf` against a stand-in token endpoint (the global `fetch` stubbed in the test), and the PKCE challenge against RFC 7636's own example.
- Mutation proved: state not compared, verifier ignored, return address by prefix, token stored unhashed, an expired session accepted, `sub` used as the id, the header still read, origin check removed per route, the attempt cookie left, a limiter that fails closed.
- **Browser acceptance cannot call Google, and no spec needs sign-in yet.** (An earlier draft said janggi seeds a local D1; it does not. Janggi's browser specs answer the whole API with a stateful fake in the page, `page.route`, so no real cookie or D1 is involved.) The user chose janggi's real method for the first spec that needs a signed-in player; it never exercises the real session cookie, so the real path is the route tests, the D1 contract and a hand check with `wrangler dev`.

## Dependencies (exact pins, each older than seven days; in the catalog)

`drizzle-orm` 0.45.3, `drizzle-kit` 0.31.11 and `oauth4webapi` 3.8.8, janggi's own. `drizzle-kit` brings deprecated `@esbuild-kit/*` sub-dependencies (its own).

## Handoffs

- **budget:** `CreditLedger.erase()` is built (2026-11-19) and is called **only for a deleted account whose 90 days have run out** (`DELETE /api/account` sweeps them), never at deletion, so deleting does not give back a fresh allowance (denial of wallet). A reserve already in flight may still write a fresh default record under the opaque id after an erase; it holds no personal data and is accepted. Asked of budget (not required): an alarm that erases an orphaned ledger by itself. Credit routes name the account from the session.
- **play:** call `GET /api/me`; the sign-in button is a link to `/api/auth/google?return=<page>` (an absolute address on an allowed origin). The workshop's calls to `POST /api/weapons` then carry the session cookie, not `X-Account-Id`.
- **ship:** the D1 binding and database name, the `LOGIN_LIMITER` binding, `ALLOWED_ORIGINS` and the secrets `GOOGLE_OAUTH_CLIENT_ID` and `GOOGLE_OAUTH_CLIENT_SECRET`, in `infra/` (never `ALLOW_LOOPBACK_ORIGINS`).
- The user verified the local Google round-trip in Chrome on 2026-11-19. `pnpm api:dev` loads the root `.env.local` with `--env-file` and sets `GOOGLE_REDIRECT_URI` from its port. Production still needs the registered callback, Worker secrets and D1 provisioning. [Manual setup](../MANUAL-SETUP-STEPS.md).

## Not in this slice

renaming the display name, ratings, rate limits beyond sign-in, and the production adapters (a paid call still needs the user's authorisation).

The library (built 2026-11-19, after sign-in) is described in `api/AGENTS.md`: every created weapon and arena is kept by id, and saving, listing and removing go by that id under per-account limits (8 weapons, 3 arenas). Its rows are erased with the account (`ON DELETE cascade`).
