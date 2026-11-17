# TODO: ship

Model: **Codex**. Follow the startup protocol in [TODO.md](TODO.md); read only relevant dependencies.

## Resume here

Checkout: develop only in this persona's assigned worktree. At startup, record its actual path/branch and last merged committed main revision here; these are not yet assigned by the workflow update. Sync main into the clean worktree before new work and delivery; main is for integration/validation only. Preserve existing unfinished legacy worktrees. See [Operations](docs/agent-reference/Operations.md#development-worktrees-and-the-integration-checkout).

Continue repository tooling/CI preparation. API/infra provisioning remains dependent on real server bindings and user authorization.

Current milestone: M3/M7–M8; the project remains on M1. Next failing test/check: Repository checks, production-preview acceptance and deployment dry runs first; live acceptance and shutdown drill only after authorized provisioning.

## Ownership

infra/, general CI/property workflow, root scripts and shared/config/ tooling, deployment configuration, manual setup and release/case-study evidence coordination. AI owns eval workflow behavior.

Reserve concrete files in [HANDOFF.md](HANDOFF.md) before overlapping another session. Shared contracts change there first; the domain owner writes the change and consumers review it.

## Dependencies/handoffs

server supplies Worker/DO/storage bindings; budget supplies operational limits; all owners supply passing slices. Independently prepare CI for existing production-preview checks. Coordinate root/workspace configuration edits with affected owners.

## Current milestone tasks

- [ ] Continue repository tooling/CI preparation. API/infra provisioning remains dependent on real server bindings and user authorization.

## Later tasks

- [ ] Add CI for checks, production-preview acceptance, deployment and live acceptance. Property checks are non-blocking; AI owns its eval workflow. Deployment remains gated on manual setup and authorization.
- [ ] Alchemy infrastructure: Worker/assets, D1, Durable Objects and rate limits. Follow `MANUAL-SETUP-STEPS.md` on a throwaway account before production; keep local Wrangler config aligned.
- [ ] Before publication, scrub secrets/history, local settings, personal paths and addresses. No deploy, commit or push without the required authorization.
- [ ] Final tuning and case-study evidence, including the shutdown drill and real measurements (`docs/focused-case-study.md`).
- [ ] Scaffold infra/ and its package instructions when server bindings exist; keep local Wrangler configuration aligned.
- [ ] Measure infrastructure costs with server/AI runtime measurements before proposing free versus Workers Paid.

## Verification/latest delivery

- [x] 2026-11-17: recorded integration-only main and persistent persona worktrees, with main merged back before resuming/delivery. Startup sync revisions and no automatic teardown are documented. Full pnpm checks passes (one slow audio render skipped); repository/link and standards/folder/caller review pass. No git/worktree mutation.

- [x] 2026-11-17: seven-persona migration delivered. All 74 source checkboxes preserved/routed; play is Claude, art/ship Codex. Startup registry red/green proven. Full pnpm checks passes (one slow audio render skipped); sandbox local-server failure resolved by unrestricted rerun. Standards and folder/caller audit complete; current milestone remains M1.

- [x] 2026-11-17: compact instructions, checklists and handoff; preserve full dated snapshots in `docs/history/`.

2026-11-17 migration: tasks redistributed from the former build/ai/art checklists; no gameplay change. Latest merged validation in HANDOFF.md: root checks, eight property tests and 199 preview acceptance tests passed; fake evals reported 126 passing and eight failing canned-response criteria. This is inherited evidence, not a new run.

At session end, record actual checks, mutation/red evidence where applicable, standards and folder/caller review; update this resume, your TODO.md status row and a concise HANDOFF.md delivery. [Pre-migration snapshot](docs/history/2026-11-17-persona-migration.md).
