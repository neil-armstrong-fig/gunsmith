# Privacy and data

What is stored, what leaves for third parties, and what deletion covers. The repo is private for now; this is written as if it
will be public. Janggi is the model: store only what is needed.

Status: design, including the user-approved 2026-11-15
[fair-play and recording direction](art/fair-play-research.md). The online
storage and controls described here are not implemented by the research delivery.

## Principles

- **Identity.** Google sign-in (`openid` scope only) is required for public
  matchmaking, credits and the library. Guests can play practice/private rooms
  with the built-in pool.
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
| Recording metadata and share permissions | Authorized completed-match access | 14 days after completion, or deletion handling below |
| Reports, case evidence references and versioned trust decisions | Fair-play investigation and correction | 90 days after flagging; duplicates do not extend the deadline |
| Keyed issuer/subject digest, applicable restriction and expiry only | Prevent the same restricted identity immediately resetting through deletion | At most 90 days after deletion; retries do not extend it |

Saved items are private; library limits are per account and never expire.

## Recordings and evidence (planned)

Bounded Durable Object journals export to private R2 storage; D1 holds metadata.
Ordinary recordings expire 14 days after completion. Flagged evidence copies
expire 90 days after flagging. Application checks stop access at expiry; lifecycle
deletion is a backstop, not an exact access cutoff.

Players and moderators can access completed-match replays. Either participant
can share a sanitized replay without a second-player approval dialog. Links
expire with the recording and may be revoked; downloaded copies cannot be
retracted. Shared exports use match-local labels and exclude raw prompts,
account/provider identifiers, network data, trust decisions and report evidence.

Private moderation evidence may include accepted inputs, server-sent visibility
and sound information, participant reports and decision records. Access is
restricted to authorized moderation operations; no evidence goes into ordinary
request logs, model calls or LangSmith. Silent matchmaking status does not waive
applicable access, objection or erasure rights. Before launch, justify purposes,
retention and the lawful basis and make the privacy/terms copy match the design.

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
in LangSmith expire on its retention schedule; the privacy page says so.

Remove account links and ordinary recording/share access with deletion, deleting
ordinary recordings and hosted shared copies involving that account. Remove
flagged personal evidence unless continued retention has a documented applicable
basis; retention is not an automatic exception to erasure. When needed for an
existing restriction, keep only the keyed identity digest, restriction and expiry
for at most 90 days after deletion. These digests remain personal data, not
anonymous data. The privacy page must explain this narrow exception; it must not
promise that every record vanishes immediately. A different Google account is
not recognized by this mechanism.

## Open items

- Confirm whether LangSmith runs can be deleted on request by metadata.
- Before online launch, verify the retention basis, erasure workflow and complete
  deletion of recording chunks, evidence copies and references. History and the
  ordinary ledger are deleted with the account; the minimal restriction record
  is the bounded exception above.
- A pseudonymous identifier (the Google `sub`) is still personal data under GDPR-style rules, so keep the stated limits and
  the deletion route honest. Not legal advice; check before the repo or the site goes public.
