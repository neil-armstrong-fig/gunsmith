# Privacy and data

What is stored, what leaves for third parties, and what deletion covers. The repo is private for now; this is written as if it
will be public. Janggi is the model: store only what is needed.

## Principles

- **Opt-in identity.** Sign-in with Google (`openid` scope only) is optional. Guests can play with the built-in pool.
- **No email, no real name.** Store Google's subject id (`sub`) and a generated display name the player may change. A hash of
  each session token, never the token.
- **The internal account id is random and opaque.** It, never the Google `sub` and never a display name, is the only user
  identifier sent to LangSmith or the AI Gateway (`metadata.user_id`). The user was right that an opaque id is not an email;
  the real exposure is the *prompt text*, which can contain anything a player types.
- **Logs contain closed application events, never request data** (janggi's `logApiEvent`): route, transport, outcome,
  status, operation, exception class. No URLs, queries, origins, headers, cookies, account ids, room codes, prompts or
  stacks.

## What is stored (D1)

| Data | Why | Kept |
| ---- | --- | ---- |
| Google `sub`, display name, created date | Identity | Until the account is deleted |
| Session token hashes, expiry | Sign-in | Until expiry or sign-out |
| Credit ledger | Daily AI allowance and refunds | Until the account is deleted |
| Library: saved weapons and arenas, **with the prompts that made them** | "Use as a base and change the prompt"; reuse for free | Until the owner deletes them or the account |
| Ratings and match history | Matchmaking and the history list | Until the account is deleted |

Saved items are private; library limits are per account and never expire.

## What leaves for third parties

| Where | What | Mitigation |
| ----- | ---- | ---------- |
| LLM provider (via AI Gateway) | The prompt text and the generated JSON | The player is told that prompts go to an AI provider; no personal identifiers are included; the judge refuses requests for personal data |
| LangSmith (US-hosted) | Traces: node inputs and outputs, tokens, cost, the opaque account id, versions | Prompt text goes through PII redaction (LangChain `piiMiddleware` or an equivalent) before the trace leaves; free-tier traces expire after 14 days; check whether runs can be deleted by metadata `(unverified)` |
| Cloudflare | Everything hosted there | Standard processor |
| Google | The sign-in | `openid` only |

Wording for the privacy page (drafted by `art` from this file): what is stored, that prompts are sent to an AI provider and
traced for quality, the retention, and how to delete.

## Deletion

`DELETE /api/account` removes the account, sessions, credits, library, ratings and history (janggi's cascade). Traces already
in LangSmith expire on its retention schedule; the privacy page says so. Private rooms and matches hold no personal data
beyond the account id.

## Open items

- Confirm whether LangSmith runs can be deleted on request by metadata.
- Decide the retention of match history and the ledger after account deletion (default: deleted with the account).
- A pseudonymous identifier (the Google `sub`) is still personal data under GDPR-style rules, so keep the stated limits and
  the deletion route honest. Not legal advice; check before the repo or the site goes public.
