# TODO: ship

Model: **Codex**. Follow the startup protocol in [TODO.md](TODO.md); read only relevant dependencies.

## Resume here

Checkout: `.claude/worktrees/ship`, branch `worktree-ship`, synced from committed main `6f6b028`. Persistent worktree; main stays integration-only. Merge newer committed main before new work/delivery when clean; never stash another session's changes.

Current slice: checks/production-preview CI and independent property workflow, with Playwright-managed preview. Owned files: two workflow YAMLs, root package script, acceptance config and ship coordination/operational docs. Project remains M1; ship supports M3/M7–M8.

Next action: review/commit this delivery when authorized, then verify the first hosted Actions run. Provisioning and live acceptance await server/budget bindings and user authorization.

## Ownership

infra/, general CI/property workflow, root scripts and shared/config/ tooling, deployment configuration, manual setup and release/case-study evidence coordination. AI owns eval workflow behavior.

Reserve concrete files in [HANDOFF.md](HANDOFF.md) before overlapping another session. Shared contracts change there first; the domain owner writes the change and consumers review it.

## Dependencies/handoffs

server supplies Worker/DO/storage bindings; budget supplies operational limits; all owners supply passing slices. Independently prepare CI for existing production-preview checks. Coordinate root/workspace configuration edits with affected owners.

## Current milestone tasks

- [x] Add repository checks, production-preview acceptance and independent property-test CI.
- [ ] Evaluate four-way acceptance sharding against the current 6.3-minute local/two-worker baseline; retain two workers per shard, unique artifacts and all-shards gating. Compare duplicated setup/build runner minutes with budget.
- [ ] Coordinate the budget/AI eval-strategy research request in HANDOFF.md; implement agreed CI mechanics after AI defines regression gates and paid authorization/spend controls are settled.
- [ ] Verify the first hosted Actions run after authorized publication; API/infra provisioning awaits bindings and authorization.

## Later tasks

- [ ] Add deployment and live acceptance after manual setup, real bindings and authorization. Property checks remain non-blocking; AI owns its eval workflow.
- [ ] Alchemy infrastructure: Worker/assets, D1, Durable Objects and rate limits. Follow `MANUAL-SETUP-STEPS.md` on a throwaway account before production; keep local Wrangler config aligned.
- [ ] Before publication, scrub secrets/history, local settings, personal paths and addresses. No deploy, commit or push without the required authorization.
- [ ] Final tuning and case-study evidence, including the shutdown drill and real measurements (`docs/focused-case-study.md`).
- [ ] Scaffold infra/ and its package instructions when server bindings exist; keep local Wrangler configuration aligned.
- [ ] Measure infrastructure costs with server/AI runtime measurements before proposing free versus Workers Paid.

## Verification/latest delivery

- [x] 2026-11-17 follow-up: recorded acceptance-sharding evaluation and budget/AI eval-strategy research in HANDOFF.md. Documentation-only; full `pnpm checks` passes (one existing slow audio render skipped), diff whitespace and root standards/folder review pass. No new files or workflow/spend changes; gameplay acceptance was not rerun.

- [x] 2026-11-17: CI/managed preview/property automation delivered in `worktree-ship` from `6f6b028`. Final `pnpm checks` passes (one slow audio render skipped); production-preview acceptance 221/221 passes with CI settings, no retries; properties 8/8 pass at 1,000 cases each. Startup red/green and grep-confirmed mutation, failure/cleanup/port probes, YAML and workflow graph checks pass. Root/acceptance/shared standards and folder/caller review complete. Hosted Actions remains unverified; no commit, push or deploy. Full concise evidence in HANDOFF.md.

- [x] 2026-11-17: recorded integration-only main and persistent persona worktrees, with main merged back before resuming/delivery. Startup sync revisions and no automatic teardown are documented. Full pnpm checks passes (one slow audio render skipped); repository/link and standards/folder/caller review pass. No git/worktree mutation.

- [x] 2026-11-17: seven-persona migration delivered. All 74 source checkboxes preserved/routed; play is Claude, art/ship Codex. Startup registry red/green proven. Full pnpm checks passes (one slow audio render skipped); sandbox local-server failure resolved by unrestricted rerun. Standards and folder/caller audit complete; current milestone remains M1.

- [x] 2026-11-17: compact instructions, checklists and handoff; preserve full dated snapshots in `docs/history/`.

2026-11-17 migration: tasks redistributed from the former build/ai/art checklists; no gameplay change. Latest merged validation in HANDOFF.md: root checks, eight property tests and 199 preview acceptance tests passed; fake evals reported 126 passing and eight failing canned-response criteria. This is inherited evidence, not a new run.

At session end, record actual checks, mutation/red evidence where applicable, standards and folder/caller review; update this resume, your TODO.md status row and a concise HANDOFF.md delivery. [Pre-migration snapshot](docs/history/2026-11-17-persona-migration.md).
