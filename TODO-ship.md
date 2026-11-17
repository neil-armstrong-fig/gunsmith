# TODO: ship

Model: **Codex**. Follow the startup protocol in [TODO.md](TODO.md); read only relevant dependencies.

## Resume here

Checkout: `.claude/worktrees/ship`, branch `worktree-ship`, synced from committed main `2d7c568`. Persistent worktree; main stays integration-only. Merge newer committed main before new work/delivery when clean; never stash another session's changes.

Current slice: open-source documentation preparation, preserving the maintained persona workflow and local case-study sources. Owned files: tracked Markdown, root ignore rules and repository discovery/checker tests. Project remains M1.

Next action: review the uncommitted cleanup. Next failing check: hosted all-shards/report acceptance after publication. Hosted profiling, eval-policy coordination and provisioning remain open; licensing and squashing are left to the user.

## Ownership

infra/, general CI/property workflow, root scripts and shared/config/ tooling, deployment configuration, manual setup and release/case-study evidence coordination. AI owns eval workflow behavior.

Reserve concrete files in [HANDOFF.md](HANDOFF.md) before overlapping another session. Shared contracts change there first; the domain owner writes the change and consumers review it.

## Dependencies/handoffs

server supplies Worker/DO/storage bindings; budget supplies operational limits; all owners supply passing slices. Independently prepare CI for existing production-preview checks. Coordinate root/workspace configuration edits with affected owners.

## Current milestone tasks

- [x] Prepare self-contained documentation and preserve original sources privately before a future open-source release.

- [x] Add repository checks, production-preview acceptance and independent property-test CI.
- [x] Implement four acceptance shards, two workers per shard, unique blob artifacts, combined HTML reporting and an all-shards gate.
- [ ] Profile the first hosted sharded run: separate setup/build/test/merge time, total runner minutes and elapsed time; compare with the recorded 6.3-minute local baseline with budget.
- [ ] Coordinate the budget/AI eval-strategy research request in HANDOFF.md; implement agreed CI mechanics after AI defines regression gates and paid authorization/spend controls are settled.
- [ ] Verify the first hosted Actions run after authorized publication; API/infra provisioning awaits bindings and authorization.

## Later tasks

- [ ] Add deployment and live acceptance after manual setup, real bindings and authorization. Property checks remain non-blocking; AI owns its eval workflow.
- [ ] Alchemy infrastructure: Worker/assets, D1, Durable Objects and rate limits. Follow `MANUAL-SETUP-STEPS.md` on a throwaway account before production; keep local Wrangler config aligned.
- [ ] Before publication, scrub secrets/history, local settings, personal paths and addresses. No deploy, commit or push without the required authorization.
- [ ] Final tuning and case-study evidence, including the shutdown drill and real measurements.
- [ ] Scaffold infra/ and its package instructions when server bindings exist; keep local Wrangler configuration aligned.
- [ ] Measure infrastructure costs with server/AI runtime measurements before proposing free versus Workers Paid.

## Verification/latest delivery

Cleanup verified: `pnpm checks` passes (2,250 tests, one slow audio render skipped); production compile passes with a chunk-size warning. Links/anchors, archive hashes and ignore behavior pass. Archive exclusion failed first and its removal kills exactly the new criterion. Root/shared/AI/engine/webapp/React/audio/acceptance standards and folder/caller audit complete. Changes remain uncommitted; no gameplay acceptance, paid eval, push or publication.
