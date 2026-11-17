# TODO: ship

Model: **Codex**. Follow the startup protocol in [TODO.md](TODO.md); read only relevant dependencies.

## Resume here

Checkout: `.claude/worktrees/ship`, branch `worktree-ship`, synced from committed main `f744267`. Persistent worktree; main stays integration-only. Merge newer committed main before new work/delivery when clean; never stash another session's changes.

Current slice: free eval root command/CI and the user-approved paid-eval policy handoff. Owned files: root package scripts, AI harness workflow, eval-policy/operational/manual-setup docs and ship coordination. Project remains M1.

Next action: AI owns the paid selector, shared local budget guard and dated samples; activation waits for reconciled November Console spend. Ship's next independent CI slices are generated Playwright-report lint exclusion and managed Worker startup for online acceptance (coordinate server); hosted profiling/publication still await setup. No paid calls or CI are enabled.

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
- [x] Settle eval policy with the user and deliver free fake CI/root mechanics; see [policy](docs/agent-reference/EvalPolicy.md).
- [ ] Receive AI-owned paid selector/guard/evidence implementation and reconciled opening spend before local paid activation.
- [ ] Verify the first hosted Actions run after authorized publication; API/infra provisioning awaits bindings and authorization.

## Later tasks

- [ ] Add deployment and live acceptance after manual setup, real bindings and authorization. Property checks remain non-blocking; AI owns its eval workflow.
- [ ] Alchemy infrastructure: Worker/assets, D1, Durable Objects and rate limits. Follow `MANUAL-SETUP-STEPS.md` on a throwaway account before production; keep local Wrangler config aligned.
- [ ] Before publication, scrub secrets/history, local settings, personal paths and addresses. No deploy, commit or push without the required authorization.
- [ ] Final tuning and case-study evidence, including the shutdown drill and real measurements.
- [ ] Scaffold infra/ and its package instructions when server bindings exist; keep local Wrangler configuration aligned.
- [ ] Measure infrastructure costs with server/AI runtime measurements before proposing free versus Workers Paid.

## Verification/latest delivery

2026-11-17 free eval gate: `pnpm evals` passes 170/170, including arena fixtures; full `pnpm checks` passes (lint/format/types, 2,567 tests, one skipped) outside sandbox after sandbox audio stalled. Missing-command red observed; five unsafe command mutants rejected with a stub process; YAML/permissions, fourteen trigger-path probes, targeted formatting, diff whitespace and root/AI/shared standards/folder/caller review pass. No new helpers/types. Free workflow remains uncommitted and unverified on hosted Actions. Paid selector/guard/dated samples remain AI-owned and pending; no paid execution or ledger initialization.

Cleanup verified: `pnpm checks` passes (2,250 tests, one slow audio render skipped); production compile passes with a chunk-size warning. Links/anchors, archive hashes and ignore behavior pass. Archive exclusion failed first and its removal kills exactly the new criterion. Root/shared/AI/engine/webapp/React/audio/acceptance standards and folder/caller audit complete. Cleanup is committed and integrated; no gameplay acceptance, paid eval, push or publication.

Integration delivery: code/assets `9d33c98`; full checks pass (2,567 tests, one existing slow render skipped), properties 14/14, fake evals 170/170, production-preview browser exit 0 (255 first-pass, one known `ShootingAcrossLevels` flake recovered). Source tips and merge hashes, conflict decisions, separate standards audit and preserved concurrent staging are in HANDOFF.md. No source checkout was written or synced. CI Worker startup and owner standards corrections remain open; hosted execution, model quality and audio re-render were not claimed.
