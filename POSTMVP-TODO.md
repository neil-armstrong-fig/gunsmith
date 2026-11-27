# Post-MVP TODO

Wanted, but not needed for the MVP ([MVP-TODO.md](MVP-TODO.md)). Gathered on 2026-11-27 from the closed sessions (play, engine, server,
budget, ship, art). Whichever session meets an item does it. The closed checklists' detail is in git: `git show 76f7374c:TODO-<persona>.md`.

## Play and feel

- [ ] `sfx-death` at a local death (the user wants it; art's file `webapp/audio/generated-audio/sfx-death.wav` exists).
- [ ] Recoil and muzzle flash.
- [ ] Art's pickup glow, once a key is agreed.
- [ ] Tune crouch's movement and vision trade-off. Check reasons to stand and the risk while repositioning.
- [ ] Play contested pickups with swapped spawns. Compare walking routes through stairs, and single-stair camping against two routes.
- [ ] The menu's "Resume" on a fresh visit.

## Bot and engine

- [ ] The bot rests at cover between bursts, and climbs further from a stair (no test makes it climb to a shooter it cannot see).
- [ ] Edge-rule gaps:
  - Cover exists only on the low ground.
  - No browser criterion covers a bullet passing over a fighter (only over dummies).
  - With three levels, a bullet is slightly stricter than sight past a ledge under a tile wide.
- [ ] Arena validity: open space, spawn and pickup reachability, wall and height limits, and ring escape, for built-ins and generated arenas.
- [ ] Deterministic output moderation: text length, charset and blocklist.
- [ ] Property tests for caps and directional visibility.
- [ ] Hitscan and more weapon behaviours, penetrable cover, full three-level play, and seeded spawn placement.
- [ ] Calibrate the power rating, caps and balancer with ai, keeping deliberately weak weapons.
- [ ] Final weapon, sound and arena schemas in `shared/` once a second consumer exists. Coordinate the M2 contract review with real consumers.

## Online and public play

- [ ] Browser coverage for the room's ring damage loop and pickup HUD.
- [ ] Match history and ratings in D1.
- [ ] Private-room spectators (up to eight, delayed), and the public FIFO matchmaker with a widening rating window.
- [ ] The [fair-play and privacy handover](docs/art/fair-play-research.md): bounded recordings, participant reports, isolated restricted
      queues, clean-match recovery with human override, and retention and erasure checks. Detection starts in observation mode.
- [ ] Measure real Durable Object and AI CPU costs, then choose free or Workers Paid (the "free-plan spike").

## Privacy and generated content

- [ ] **Private generation history in production** stays off until the controller has reviewed the assessments, the safeguards pass local
      verification and the matching Make notice is published. The notice must reflect the best-effort redaction design (`6c919fbc`).
- [ ] **Rights handling for private history:** maintainer-only access, and access, objection and erasure requests
      ([privacy design](docs/privacy-and-data.md#private-generation-history)).
- [ ] **Appearance review:** re-review AI's fallback weapon body and outline at 64 and 32 px a tile, and review the generated-appearance
      findings with ai and engine.
- [ ] **Combat listening review** with headphones and speakers (masking, fatigue and levels) once weapon-specific shot synthesis lands.
- [ ] Remaining interface art (slot badges, panels and buttons, the power gauge, pipeline progress, the reveal frame) and player-facing
      copy (onboarding, example prompts, rejection, AI-off and credit explanations).

## Budget and operations

- [ ] Optional ledger work:
  - an alarm for orphaned ledgers
  - pricing a weapon's calls by stage
- [ ] Tracing on every path (`ctx.waitUntil(awaitAllCallbacks())`), with prompt PII redacted and no Google identities. Trace failures must
      not delay play.
- [ ] AI Gateway, per-user rate and spend limits, and the provider's hard cap. Each needs the user's authorisation.

## Release and publication

- [ ] Turn on automated deployment (`GUNSMITH_DEPLOY_ENABLED`) once CI is stable, and verify that a GitHub redeploy keeps the D1 and Durable
      Object resources.
- [ ] Before making the repository public:
  - Scrub secrets, local settings, personal paths and addresses from the tree and history.
  - Run a secret scanner over the whole history.
- [ ] Final tuning and case-study evidence: the shutdown drill and real measurements, diagrams, logo, favicons, social preview and README banner.

## Standards follow-ups

- [ ] `api/src/durable-objects/match/room/MatchRoom.ts` has a loose `withoutOneShots` helper beside the class (netcode will be in that file).
- [ ] `BracketPlaces` has an unnamed `left | right` parameter type.
