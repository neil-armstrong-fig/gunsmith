# Privacy and data

What is stored, what leaves for third parties, and what deletion covers. The repo is private for now; this is written as if it
will be public. Store only what is needed.

Status: the Make sections describe the current code and the proposed private generation history. Recording and fair-play
controls remain design work. [Fair-play and recording direction](art/fair-play-research.md)

## Principles

- **Identity.** Google sign-in (`openid` scope only) is required for public
  matchmaking, credits and the library. Guests can play practice/private rooms
  with the built-in pool.
- **No email, no real name.** Store Google's subject id (`sub`) and a generated display name the player may change. A hash of
  each session token, never the token.
- **The internal account id is random and opaque.** If approved tracing or gateway metadata needs an identifier, use only
  that id (`metadata.user_id`). Free-text prompts can contain personal information about the player or someone else.
- **Logs contain closed application events, never request data**: route, transport, outcome,
  status, operation, exception class. No URLs, queries, origins, headers, cookies, account ids, room codes, prompts or
  stacks.

## What is stored (D1)

| Data | Why | Kept |
| ---- | --- | ---- |
| Google `sub`, display name, created date | Identity | Until the account is deleted |
| Session token hashes, expiry | Sign-in | Until expiry or sign-out |
| Credit ledger | Daily AI allowance and refunds | Until the account is deleted, **then 90 days more** (below) |
| Deleted-account record: keyed HMAC of the Google `sub`, the ledger's opaque id, expiry | So deleting and signing in again cannot reset the daily allowance (abuse of paid model calls) | 90 days after deletion, then deleted with the ledger |
| Generated weapons and arenas, with their original prompts and shelf status | Save later by server id and reuse the prompt | Until account deletion under current code |
| Private generation history (test fixtures only) | Diagnose Make outcomes for internal tuning | Available for 14 days; removed by the next daily sweep or by account deletion |
| Ratings and match history (planned) | Matchmaking and the history list | Until the account is deleted |
| Recording metadata and share permissions (planned) | Authorized completed-match access | 14 days after completion, or deletion handling below |
| Reports, case evidence references and versioned trust decisions (planned) | Fair-play investigation and correction | 90 days after flagging; duplicates do not extend the deadline |
| Keyed issuer/subject digest, applicable restriction and expiry only (planned) | Prevent the same restricted identity immediately resetting through deletion | At most 90 days after deletion; retries do not extend it |

Signed-in Make stores each created weapon or arena and its prompt before the player clicks Save. Save adds it to the
account shelf. Removing it from the shelf frees a slot and leaves the item and prompt in storage. The dedicated history
privacy check and 14-day cutoff apply only to attempt records. The generated-item row has no scheduled expiry today.

## Private generation history

Local D1 tests use a fake privacy checker to record attempt outcomes separately from generated items. A row contains the
account id, item kind, attempt time, pipeline version, outcome, repair counts and any closed failure reason. It includes
verbatim text only when the relevance judge accepts the prompt and an independent privacy check clears it. Rejections,
unjudged prompts, privacy denials and checker errors leave the attempt metadata alone. A generated weapon with a built-in
drawing records success with fallback. An arena that fails validation records a failed generation.

Internal reads exclude attempts at 14 days. The daily Worker sweep removes expired rows and account deletion removes that
account’s history immediately. The production checker currently leaves the gate closed for both metadata and prompt text.

### Make notices

Both signed-in forms show the current copy before Make, with a keyboard-accessible **Privacy Policy** link. The policy
identifies Neil Armstrong and routes privacy requests to his personal site’s contact form. Check the deployed processing
disclosures before publishing the pages. [ICO transparency guidance for services children may use](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/4-transparency/)

**Current Make**

> Make sends your prompt to an AI provider to create your item. If Make creates an item, we keep it with your prompt so you can save it to your shelf and reuse the prompt.

**If private history is approved**, retain the current copy and add this paragraph before the privacy link.

> Our team can review private records of Make attempts for up to 14 days to improve how Make works. We include your prompt in that record only if it’s about making an item and passes a separate privacy check.

Give the right to object its own line. The privacy notice should explain the daily cleanup and how to request a copy or
deletion. [ICO right to object guidance](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/individual-rights/individual-rights/right-to-object/)

> You can object to our use of your data to improve Make.

### Draft legitimate interests assessment

| Test | Draft finding and evidence needed |
| ---- | ---- |
| Purpose | Diagnose generation failures and tune the pipeline using attempt outcomes. Record which fixes the evidence supports, such as a repair instruction change or a validation regression. |
| Necessity | Use the same synthetic and voluntarily shared examples to compare diagnosis with metadata alone, with volunteered text and with verbatim history. Record which actionable failures require verbatim text and why a less intrusive source cannot cover them. Assess separately whether routine tuning needs an account link and the full 14-day window. The necessity of account-linked verbatim history remains open. |
| Balancing | Make users may expect provider processing and an item on their account. Reviewing their words for tuning is an additional use. Children and people named in a prompt may face greater harm from disclosure. Weigh that harm against the documented benefits after testing the privacy gate, narrow review access, retention and rights workflow. |

Record the controller’s decision and supporting evidence here before enabling capture. If metadata or volunteered examples
meet the purpose, use that narrower approach and keep verbatim capture off. [ICO legitimate interests assessment guidance](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/a-guide-to-lawful-basis/legitimate-interests/)

### Draft assessment of impact on children

Assume children may play Gunsmith. The proposed change is an additional copy of account-linked attempts available to a
small group for tuning. Any benefit to children comes through fixing Make failures. Use age-appropriate examples and
feedback, including input from children and parents where appropriate, to check whether the notice and rights steps make sense.

| Risk to children | Safeguard and evidence to review |
| ---- | ---- |
| A prompt contains a name, contact detail or sensitive information about the child or another person. | Test the independent checker against relevant prompts containing synthetic personal information. On a denial or error, confirm both routes store only metadata and keep text out of ordinary logs. Document limits of the checker and any remaining risk. |
| Someone reads or reuses account-linked text outside the tuning purpose. | Review access by named maintainers, use account-scoped lookups for rights requests, and confirm the 14-day read cutoff, daily cleanup and immediate account deletion. |
| A child cannot understand the second use or exercise their rights. | Test the notice on both Make forms before submission and rehearse an access, objection and deletion request from intake to response. |

Document consultation, residual risks and the controller’s decision. Keep production history disabled pending the
assessments, the verified checker and review workflow, and publication of the matching notice. [ICO children’s DPIA template](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/annex-d-dpia-template/)

### Maintainer review and rights requests

The controller designates maintainers by name, limits access to the tuning and rights tasks they handle, and removes access
when the assignment ends. Keep review in internal tooling. The published privacy notice routes requests to a verified
contact monitored by those maintainers.

1. Log the receipt date, request type, assigned maintainer and response deadline. Verify identity proportionately before
   accessing or disclosing account data. Check authority when someone acts for another person.
2. Scope the lookup to the verified account. For access, review the result for other people’s information and send the
   appropriate copy through a secure channel. For erasure, remove the applicable records and verify the result. For an
   upheld objection, stop future history processing for that account and determine which existing records to erase. Apply
   the request to generated items separately where it covers those records.
3. Tell the requester the outcome and any reason for declining part of the request. Keep only the case details needed to
   evidence the response, without prompt text or copies of identity documents in the case log.

The API follow-up implements access restrictions, account-scoped reads and erasure, and enforcement of upheld objections.
AI supplies the checker. Start its local D1 verification with a relevant prompt containing synthetic personal information,
then cover denial, checker failure, expiry, deletion and the default closed gate for both Make routes. [ICO right of access](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/individual-rights/individual-rights/right-of-access/), [ICO right to erasure](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/individual-rights/individual-rights/right-to-erasure/)

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
| Anthropic (current Worker adapter) | Prompt text and model inputs and outputs. The adapter receives the prompt without an account id. | Free text can contain personal information. Verify deployed routing and provider retention before publishing the notice. |
| Cloudflare AI Gateway (proposed) | Provider traffic if enabled | Verify routing, logging and retention before use. |
| LangSmith (proposed production tracing) | Trace inputs and outputs, tokens, cost, opaque account id and versions if configured | Verify enablement, redaction before export, hosting region, retention and deletion before making a public claim. |
| Cloudflare | Everything hosted there | Standard processor |
| Google | The sign-in | `openid` only |

The public privacy page should state the verified controller and contact, processing purposes and lawful bases, recipients,
any applicable international transfers and safeguards, retention, and how to exercise rights and complain. Describe tracing
only if verified for the deployed service.

## Deletion

`DELETE /api/account` removes the account, sessions, generated items and their prompts, and any private generation history at once. **Credits are the exception, for one stated purpose:** deleting must not give back a fresh allowance, or one Google account could reset its daily AI credits (and the paid model calls behind them) by deleting and signing in again. So for 90 days the database keeps only the keyed HMAC of the Google `sub` (a secret key, `ACCOUNT_DIGEST_KEY`), the opaque id the ledger holds the credits under, and the expiry; signing in again within that time gets the same ledger. Once the record expires, a daily sweep or another account deletion removes it and erases the ledger. The digest is personal data while kept, not anonymous; a different Google account is not recognised. **Why 90 days and not longer (2026-11-19):** the allowance refills at 00:00 UTC, so a day would stop the same abuse and 90 days is already the ceiling this document allows for a record kept past deletion; regulators judge such retention by necessity for the purpose and a documented balancing test (a 2-year retention was accepted in one published EDPB case, on facts about repeat account creation, not as a general rule), so a longer period needs a reason this purpose does not have (a non-refilling paid balance would be one). Not legal advice; the privacy page must describe this.

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

- Confirm deployed provider routing and retention, tracing enablement, redaction and whether any third-party records can be erased on request.
- Confirm the retention period for generated items left off the shelf. The 14-day history sweep does not remove them.
- Before online launch, verify the retention basis, erasure workflow and complete
  deletion of recording chunks, evidence copies and references. History is deleted with the account and the
  ordinary ledger 90 days after it (the deleted-account record above); the minimal restriction record
  is the bounded exception above.
- A pseudonymous identifier (the Google `sub`) is still personal data under GDPR-style rules, so keep the stated limits and
  the deletion route honest. Not legal advice; check before the repo or the site goes public.
