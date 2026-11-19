# Sign-in

**Status: approved as a proposal, nothing built (server, 2026-11-19).** The design copies janggi's `api/` (`~/Development/Personal/janggi/api`), which already ships it. No dependency has been added and no code written: the three pins below wait for the user's go.

## Why now

Sign-in gates the production generation path. While the account id is the unauthenticated `X-Account-Id` header, anyone could spend another player's credits, or send a fresh id per request for ten free credits each, so no production `WeaponSmith` or `ArenaSmith` may be wired. Library limits and `DELETE /api/account` need a real account too. Guests keep practice and private rooms ([privacy](privacy-and-data.md)).

## The flow

- `GET /api/auth/google?return=` sends the player to Google: code flow with PKCE (S256), scope `openid` only, a random `state`. The attempt (state, verifier, checked return address) rides in a short cookie: `HttpOnly; Secure; SameSite=Lax`, path `/api/auth/google`, ten minutes.
- `GET /api/auth/google/callback` compares the cookie's state, exchanges the code with `oauth4webapi` (it checks issuer, audience and expiry; the ID token's signature is not re-checked, which OpenID Connect allows for a token received straight from the token endpoint over TLS), reads `sub`, finds or creates the account and sets the session. **Any failure redirects back signed out**; there is no error page.
- A **session** is a 256-bit random token in an `HttpOnly; Secure; SameSite=Lax` cookie for 30 days. D1 keeps only `sha256(token)`, so a leaked table cannot be replayed as cookies.
- `POST /api/auth/logout` ends it and succeeds with none. `GET /api/me` answers `{signedIn, displayName?}` (the browser's one question; play builds the button). `DELETE /api/account` removes the user and its sessions.

## Decisions

1. **The account id is an opaque `crypto.randomUUID()`**, never the Google `sub` or a name. It is the `CREDITS.getByName(accountId)` name. `routes/shared/account-id/ParseAccountId` reads the session instead of `X-Account-Id` and **the header is deleted**, with no back door. The weapon, arena and credit routes change in the one shared guard; their tests use a fake signed-in account.
2. **Same origin, so no CORS.** Two cheap guards stay: the `Origin` check on state-changing requests and on the WebSocket upgrade, and the return address checked **by whole origin, never by prefix** (an open redirect would let any page use the sign-in to send someone on). Allowed origins come from one variable (`ALLOWED_ORIGINS`: the site and `http://localhost` dev ports).
3. **Guests are unchanged.** Rooms and practice need no session. Sign-in is required for generation, credits, the library and the later public queue. A signed-in account is not put into a room yet.
4. **D1 with Drizzle, in `api/src/database/` alone** (plain functions, one per operation; only that folder touches D1). Tables now: `users` (`id`, unique `google_sub`, `display_name`, `created_at`) and `sessions` (`id_hash` primary key, `user_id` cascading, `expires_at`). No email and no real name. `drizzle-kit generate --name=<change>` writes the SQL, which is inspected; **Wrangler applies it** (never `drizzle-kit migrate` or `push` too). Library, ratings and history tables arrive with their own slices.
5. **Rate limit:** a Cloudflare Rate Limiting binding `LOGIN_LIMITER`, 10 a minute per address. A failing binding lets the request through.
6. **Logs hold closed events only** (route, outcome, status, error class), never a cookie, an account id or a URL ([privacy](privacy-and-data.md)).

## How it is tested

Three ways, each where it is cheapest. Differences from janggi are in bold.

- Routes against an in-memory database and a fake Google, **passed in as arguments** (like `GenerationPipelines`), **not by module mocking**.
- Database functions against a real local D1 through one contract test the in-memory and the real functions both pass, so the two cannot differ.
- `googleSubjectOf` against a stand-in token endpoint, and the PKCE challenge against RFC 7636's own example.
- `ApiWorker.ts` stays untested wiring. Mutation to prove: state not compared, verifier ignored, return address by prefix, token stored unhashed, an expired session accepted, `sub` used as the id.
- **Browser acceptance cannot call Google.** Janggi's way: a local-only helper inserts a `users` and a `sessions` row (the hash of a known token) into the **local** D1 and gives the page the cookie. No test route, no environment switch, nothing in the deployed Worker. (Asked of the user; the alternative is a fake provider injected only in tests.)

## Dependencies (exact pins, each older than seven days; not yet added)

`drizzle-orm` 0.45.3, `drizzle-kit` 0.31.11 and `oauth4webapi` 3.8.8, janggi's own. `wrangler` and `@cloudflare/workers-types` are already here.

## Handoffs

- **budget:** `DELETE /api/account` needs a `delete` on `CreditLedger` (the account's object). After sign-in, credit routes name the account from the session.
- **play:** call `GET /api/me`; the sign-in button is a link to `/api/auth/google?return=<page>`.
- **ship:** the D1 binding and database name, the `LOGIN_LIMITER` binding, `ALLOWED_ORIGINS`, and the secrets `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`, in `infra/`.
- **the user:** the Google OAuth client with its redirect URIs, the D1 database id and `api/.dev.vars` (`MANUAL-SETUP-STEPS.md` steps 2, 3 and 13). The agents never read `.dev.vars`.

## Not in this slice

Renaming the display name, the library and its limits, ratings, rate limits beyond sign-in, and the production adapters (a paid call still needs the user's authorisation).
