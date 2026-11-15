# Fair play, accounts and match recording

Owner: `art/research`; researched 2026-11-15. User-approved design direction,
implemented here as documentation only. Build owns the online implementation;
AI owns generation accounting with build. No API, replay format, detector,
restriction or new shared type exists as a result of this document.

## Decisions and limits

- Require Google sign-in for public matchmaking. Guests retain practice and
  private rooms with the built-in pool. More providers can follow later.
- Record matches for players and moderators. Either player may share a completed,
  sanitized replay without the other's approval. No extra consent dialog.
- Prefer silent, reversible restricted matchmaking to account bans for gameplay
  cheating. Combine automatic corroboration with human review and override.
- Restore trust through completed clean matches, never inactivity alone. An empty
  restricted queue may prevent recovery; human correction remains available.
- Publish the implementation and synthetic tests. Protect credentials, live
  thresholds, account evidence and calibration data separately.
- Retain ordinary hosted recordings for 14 days and flagged evidence for 90 days.
  After deletion, retain only a minimal restriction record for up to 90 days.

These are product choices, not claims that the approach eliminates cheating.
The ordinary account and credit design remains in [privacy](../privacy-and-data.md)
and [cost controls](../cost-and-budget.md). This work must not delay M1's game-first
work; the prevention and evidence baseline belongs with real online play.

## Anti-cheat with this stack

### What authority prevents

The proposed Worker authenticates requests and the per-match Durable Object owns
the fixed tick and world. Inputs request actions; they never supply authoritative
positions, hits, damage, weapon statistics or match results. The shared engine
enforces movement, ammunition, cooldowns, geometry and validated definitions.

This fits server-side fog: do not send hidden entities and hope a shader hides
them. Riot describes withholding irrelevant actor updates, including the extra
work needed for audio, effects and newly visible state. Its optimistic visibility
implementation is not a reason to loosen Gunsmith's own strict fog contract.
[Riot engineering](https://www.riotgames.com/en/news/demolishing-wallhacks-valorants-fog-war)

Build's online acceptance criteria:

- Validate message shape, finite numbers, legal values, size, sequence and seat
  authorization. Strip untrusted identity headers at the Worker boundary.
- Bound input processing per tick. More packets cannot grant extra movement or
  firing; client clocks never advance authoritative time.
- Enforce session, origin and seat authorization on connect and reconnect, and
  invalidate access when sessions are revoked. Origin checks supplement auth;
  non-browser clients can forge an Origin header.
- Rate-limit messages, connections and expensive operations in application code.
  Cloudflare's WAF checks the WebSocket upgrade but not subsequent frames.
  [Cloudflare WebSockets](https://developers.cloudflare.com/network/websockets/)
- Apply visibility to every outbound path: snapshots, reconnects, sounds,
  projectiles, effects, debugging/state hooks, spectator and recording endpoints.
  Clear obsolete hidden-entity markers. Known dim terrain remains public.
- Keep seeds server-side when they reveal hidden pickup placements or future
  random outcomes. Browser prediction must not need the full secret world.

OWASP supports handshake authentication, explicit origin allowlists, message
validation and flood protection. Its suggested logging fields do not override
this project's stricter closed-event logging: identifiable evidence goes into
the controlled evidence store, not request logs.
[OWASP WebSocket guidance](https://cheatsheetseries.owasp.org/cheatsheets/WebSocket_Security_Cheat_Sheet.html)

### What remains possible

An aimbot can choose perfectly legal aim/fire inputs using visible state or
rendered frames. Macros, external assistance, collusion and remembering a previously
seen opponent are also outside what authority alone can prevent. Browser code,
including the shared engine, is inspectable and replaceable. Obfuscation or a
client integrity check cannot make that client trusted.

Research into aimbot detection reports accuracy and overhead challenges; results
on CS:GO are not evidence of accuracy for this top-down game.
[BotScreen, USENIX Security 2023](https://www.usenix.org/conference/usenixsecurity23/presentation/choi)

At 20 Hz, a tick is 50 ms. Arrival jitter, batching and visibility updates limit
reaction-time inference. A snap, a good win rate, a new account, a rejected command
or apparent aiming into fog is not independently proof of cheating. Record such
signals with context; do not invent universal human-aim thresholds.

## Account farming and identity spoofing

Google OIDC authenticates an account. Its stable `sub` is the identity key, not an
email address. Use the validated issuer and subject, map them to the project's
opaque account id, and preserve the planned PKCE/state/nonce and token validation.
[Google OIDC](https://developers.google.com/identity/openid-connect/openid-connect)

Google supports multiple accounts, so sign-in does not prove one person, device
or household. Standard claims do not provide a trustworthy account-creation age.
Use Gunsmith's own account age only as context, never proof of abuse.
[Google multi-account support](https://support.google.com/accounts/answer/1721977?hl=en)

Recommended baseline:

- Require sign-in for the public queue, enforced on the server rather than only
  in the UI. Allow one public queue entry/active seat per account.
- Apply account-based limits plus conservative network burst controls to
  onboarding, queue entry, generation and reporting. Shared networks, VPNs and
  browser changes alone must not cause restrictions or linked-account guilt.
- Use Turnstile on suspicious onboarding bursts. Validate on the server, check
  the expected hostname/action, bind successful verification to the intended
  operation and make account creation idempotent. Tokens expire after five minutes
  and reuse protection is subject to network convergence; Turnstile is not an
  identity or exact-once account-creation service.
  [Turnstile validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)
- Preserve atomic account credit spend and a global pre-call budget reservation.
  Farming accounts may increase demand but must not multiply the global spend
  ceiling. Handle refunds/retries idempotently with AI's existing ledger design.
- Use edge rate limiting for bursts, not exact allowances. Its counters are
  approximate and location-local; strict worldwide limits require coordinated
  state such as a Durable Object or atomic ledger operations.
  [Workers rate limiting](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)
- Defer phone verification, identity documents, paid fraud services and browser
  fingerprinting. Fingerprinting has privacy costs and no trusted browser-device
  identity guarantee. [W3C fingerprinting guidance](https://www.w3.org/TR/fingerprinting-guidance/)

For future providers, link identities only through explicit authenticated linking,
not matching emails. Linking must not reset credits or restrictions. A keyed
digest of canonical issuer/subject can recognize the same deleted restricted
identity for 90 days; a different Google account can still evade that link.
Keep its key server-side and preserve recognition across any planned key rotation.

## Recordings for interest and moderation

### Data and access

Record authoritative initial conditions, resolved arena/weapon definitions,
accepted inputs indexed by tick, lifecycle events and periodic checkpoints.
Include engine/build and replay-format versions; retain a compatible playback
implementation. A seed or hash alone is insufficient if the definitions or old
engine are lost. Playback must never regenerate content through an LLM.

Moderation also needs each player's server-sent visibility and sound information,
with tick/sequence context. This explains legitimate information advantages and
prior sightings. It establishes what the server sent, not when a client displayed
a frame or what a human noticed. Separate that evidence from the shareable replay.

Players and moderators may watch a completed match. Either player can create a
revocable share link or download a sanitized replay while it is retained. Shared
links expire with the hosted recording; unsharing cannot retract downloaded copies.
Exports use match-local player labels and exclude provider/account ids, session
data, network identifiers, reports, trust state, detector outputs and raw prompts.
Omit prompt-derived free-text names/descriptions from exports as well. Resolved
visual definitions are data validated by the normal renderer boundaries.

Never serve an unfinished full-view recording to players or their alternate
accounts. In public matches, full-view spectator access waits until the whole
best-of-three is complete. A delay alone still offers an information advantage.
Private rooms may retain the host-set spectator delay; they do not establish the
same competitive isolation guarantee. A round ending is not a match ending.

### Storage, reliability and cost

- Journal bounded batches in the Match Durable Object's durable storage; export
  chunks to a private R2 bucket. Store metadata/access/report references in D1.
  Do not write a D1 row or R2 object for every tick.
- Export without blocking the simulation. Use idempotent chunk identities,
  ordered manifests and retries, with a bounded spool and recording budget.
  Object restarts, disconnects and upload failures must not silently lose the
  recording's completeness status. Incomplete evidence cannot justify guilt.
- Read through an authorized Worker route; random object names are not access
  control. Do not expose the evidence bucket through a public domain or `r2.dev`.
  [R2 access defaults](https://developers.cloudflare.com/r2/buckets/public-buckets/)
- Prototype storage size, write/read operations, CPU and playback on the actual
  wire format before choosing batching and checkpoint intervals. Server video
  capture and automated video rendering are deferred.

Sizing example, not a benchmark: two players × 20 inputs/second × 600 seconds ×
32 assumed bytes/input = 768,000 bytes (0.768 MB), excluding checkpoints, events,
visibility evidence, headers and compression. One thousand such input streams
would be 0.768 GB. Measure the omitted data before estimating total capacity.

R2 Standard currently includes 10 GB-month, one million Class A and ten million
Class B operations monthly. Beyond allowances, storage is $0.015/GB-month, Class A
$4.50/million and Class B $0.36/million; R2 egress is free. Workers/DO/D1 costs,
rounding and existing usage are additional. This is not a guarantee of a free
deployment. [R2 pricing](https://developers.cloudflare.com/r2/pricing/)

## Reports, silent restrictions and recovery

Limited matchmaking is a documented industry technique, but not universally
better than bans. Activision describes a separate pool for investigation and
distinguishes suspicion from a confirmed cheater. That does not validate any
particular detection threshold for Gunsmith.
[RICOCHET limited matchmaking](https://www.callofduty.com/blog/2025/03/call-of-duty-ricochet-black-ops-6-warzone-season-three-anti-cheat-update)

### Reports and decisions

Allow a participant to report their opponent from the match/history, with a
category and optional round/time and short note. Verify participation server-side,
deduplicate repeated reports from that participant about that opponent/match,
bound free text and attach existing server evidence. Escape notes in moderator UI.
No mandatory video upload or public accusation is needed.

Reports prioritize cases, never independently reduce trust. Activision reports
inaccurate player accusations and discounts duplicate reports; report volume
should not become a brigading mechanism here either.
[RICOCHET reporting](https://www.callofduty.com/blog/2025/03/call-of-duty-ricochet-black-ops-6-warzone-season-three-anti-cheat-update)

Automation should first capture evidence and produce versioned decisions in
observation mode. Enable automatic restriction only for corroborated server
signals validated against reviewed examples. Two transformations of the same
measurement are not independent corroboration. Label protocol faults, client bugs,
network problems and suspicious behavior separately. Reject invalid actions and
contain floods immediately without declaring their sender a cheater.

Store decision version, evidence references, reasons and operator overrides in the
private evidence system. A moderator can inspect both perspectives, reverse a
mistake and correct associated state. No LLM decides guilt. Keep an enforcement-off
switch that stops new automatic decisions while retaining prevention and review.

### Pools and rehabilitation

Keep two physical public pools: normal and restricted. Server-only observation
and recovery states may exist without creating further queues. Never send trust
state or detection reasons to ordinary clients. No explicit restriction banner;
ordinary truthful searching/no-opponent status suffices. Silent placement can
still be inferred from wait times, opponents or alternate accounts.

The matchmaker must never cross the pool boundary when widening rating windows
or after long waits. Check current eligibility when pairing and admitting a seat,
not only at enqueue. Restricted matches grant no normal rating gains. Private
rooms remain explicitly chosen, unranked play and do not bypass public eligibility.

Recovery uses meaningful completed clean matches observed by the server, not idle
time, disconnects, instant forfeits, practice, private rooms or repeated cooperative
opponent farming. Deduplicate evidence and prevent a single match from granting
multiple recovery steps. Promote gradually; repeat corroborated evidence can
reverse progress. "Clean" means no detected problem, not proof of innocence.
Exact thresholds require calibration and versioning before automatic enforcement.

An empty restricted queue can strand a player. The user chose clean-match recovery
over automatic timed release; retain manual review/contact for mistaken placement.
Human correction may restore trust without clean matches. Restriction-record
retention expiry is deletion of data, not earned good-behavior credit.

Rate limits, disconnections and access blocks remain available against attacks on
the service. Restricted gameplay does not contain account farming or AI spend.

## Open source and privacy

Publish authority/visibility enforcement, replay formats, matchmaking mechanics,
synthetic adversarial fixtures and property tests. Keep credentials, production
threshold overrides, calibration datasets, identity links and moderator evidence
out of the public repository. Development defaults and fixture thresholds can be
public; do not couple tests to secret production values.

Lichess publishes its server and lists cheat-detection projects. This demonstrates
that openness and fair-play work coexist, not that all current detection details
are necessarily public or that openness alone prevents evasion.
[Lichess source catalogue](https://lichess.org/source)

Private thresholds are a modest evasion cost, not a security boundary. Validation,
fog and authorization must remain effective with the source known. Do not create
a private engine fork or rely on browser obfuscation for security.

Retention defaults are 14 days after completion for ordinary recordings and share
links, and 90 days after flagging for a bounded case/evidence copy. Duplicate reports
do not continually extend retention. Retain only a keyed identity digest,
restriction and expiry for at most 90 days after deletion, when needed to enforce
an existing restriction. Other account data follows the normal deletion route.
Digests remain pseudonymous personal data, not anonymous data.

Implement application-level expiry checks and deletion of all stored copies and
references; use R2 lifecycle rules as a backstop. Cloudflare says lifecycle removal
typically occurs within 24 hours of expiry, so it is not an exact access cutoff.
[R2 lifecycle behavior](https://developers.cloudflare.com/r2/buckets/object-lifecycles/)

Document purpose, necessity, access controls, deletion handling and the retention
basis before launch. These periods are product defaults, not statutory periods or
a legal conclusion that retention is always permitted. Silent UI placement does
not override applicable access, objection or erasure rights. No extra replay
consent flow is proposed; privacy/terms must match actual handling.
[ICO retention guidance](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-protection-principles/a-guide-to-the-data-protection-principles/storage-limitation/),
[ICO erasure guidance](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/individual-rights/individual-rights/right-to-erasure/)

## Build/AI handoff and proof

Build implements the online baseline test-first, then recording and reports, then
observation-mode detection/recovery. Enable behavioral enforcement only after
calibration; sophisticated classifiers and server-rendered video are deferred.
AI coordinates atomic spend/refunds/global reservations with build. Do not send
replays, identity links or moderation cases to LangSmith or models.

Public interface additions are capabilities to design when their consumers exist:
authorized completed-match replay/share access, participant reporting, moderator
case access/override and versioned recording data. Trust decisions stay server-only.
Build owns final routes, schemas and wire types; nothing moves to `shared/` early.

Required failing acceptance scenarios and mutation/property coverage:

- Forged inputs, non-finite values, floods and repeated/reordered messages never
  grant extra movement, firing, damage or unauthorized seats.
- Hidden data never escapes through reconnects, effects, seeds, debugging,
  spectator or unfinished recording access. Known terrain still renders dimly.
- Record/replay round trips agree at checkpoints across rounds and reconnects;
  mismatched versions, corrupt chunks and incomplete uploads are explicit.
- Restart/retry produces no duplicate chunks, report effects, spends or recovery
  progress. Failure/backpressure does not stall simulation or grow storage forever.
- Nonparticipants cannot report or retrieve private recordings/cases; shared
  exports omit identifiers, raw prompts and security evidence.
- Report spam, a shared IP, one suspicious aim event and inactivity alone cannot
  restrict a player or grant recovery. Simulated jitter/packet batching and skilled
  legitimate play are negative regression examples.
- Normal/restricted pool isolation survives widening searches, reconnects, races
  and changed eligibility. Empty-pool behavior and manual correction are covered.
- Clean-match recovery resists collusion and repeated-opponent farming; decision
  replay is deterministic from evidence, policy version and explicit evaluation time.
- Same-identity deletion/recreation preserves the minimal applicable restriction;
  retention expiry removes data without resetting its deadline on retries.

Property/regression tests prove invariants, not real detection accuracy. Keep
reviewed legitimate/cheating examples separate from calibration data; measure
false positives, precision and coverage before enabling each automatic rule.
Track review reversals, recovery outcomes, queue wait/empty-pool rates, recording
completeness, CPU and storage costs. A policy change needs new evaluation and
rollback support. No such tests or measurements were performed by this doc pass.
