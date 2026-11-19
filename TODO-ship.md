# TODO: ship

Model: **Codex**. Follow the startup protocol in [TODO.md](TODO.md); read only relevant dependencies.

## Resume here

Checkout: `.claude/worktrees/ship`, branch `worktree-ship`, synced from committed main `6fed51d`. Persistent worktree. Merge newer committed main before new work when clean.

Current slice: The M1 thumbnail placement follow-up is integrated from `30f2230` via `c2522dd`. `WeaponThumbnailUrl.ts` now sits under its sole caller, `InventorySlot.tsx`. The shared appearance parser and SVG renderer still supply the drawing.

Next action: Art is planning the workshop weapon result card and suggested that Ship reproduce the intermittent `DrawingThePickupMarker` pixel failure on a managed production preview and capture the failing screenshot for the owner. Production HUD wiring awaits AI and Engine's weapon-to-appearance association. When it lands, the first criterion should show that a generated weapon keeps its HUD drawing from creation through equip. Hosted CI and profiling await publication. AI owns paid selector/guard/evidence and opening spend reconciliation.

## MVP priority

Own release verification for the hosted private-room MVP. Collect Worker, auth and library requirements from Server and spend and alert bindings from Budget. Prepare hosted CI and deployment around those consumers. Run live acceptance and record the release evidence once authorized, with Budget owning the shutdown drill. See [the shared priorities](TODO.md#mvp-integration-priorities) and [handoffs](HANDOFF.md#mvp-ownership-and-handoffs).

## Ownership

infra/, general CI/property workflow, root scripts and shared/config/ tooling, deployment configuration, manual setup and release/case-study evidence coordination. AI owns eval workflow behavior.

Reserve concrete files in [HANDOFF.md](HANDOFF.md) before overlapping another session. Shared contracts change there first; the domain owner writes the change and consumers review it.

## Dependencies/handoffs

server supplies Worker/DO/storage bindings; budget supplies operational limits; all owners supply passing slices. Independently prepare CI for existing production-preview checks. Coordinate root/workspace configuration edits with affected owners.

## Current milestone tasks

- [x] Prepare self-contained documentation and preserve original sources privately before a future open-source release.

- [x] Add repository checks, production-preview acceptance and independent property-test CI.
- [x] Implement four acceptance shards, two workers per shard, unique blob artifacts, combined HTML reporting and an all-shards gate.
- [x] Manage local Worker startup and external API preview scripts; exclude generated Playwright reports from lint.
- [x] Budget request: enforce declarations below callers, including tests; reject module-level const arrow/function helpers, preserving nested const functions. Full cleanup, no baseline.
- [ ] When infra is scaffolded, declare `CREDITS` → `CreditLedger` per account and singleton `SPEND` → `SpendLedger`, retaining migration `v2` with both `new_sqlite_classes`. D1 is for accounts/sessions/library/ratings/history; no provisioning in this slice.
- [ ] Spend-alert email (from budget, built 2026-11-18 in `worktree-budget`, see [cost-and-budget.md](docs/cost-and-budget.md)): when infra is scaffolded, declare the `ALERT_MAIL` `send_email` binding (no `destination_address`) and the `ALERT_FROM_ADDRESS` var (`alerts@neilarmstrong.dev`, a sender on the zone with Email Routing) as `api/wrangler.jsonc` does. **`ALERT_TO_ADDRESS` is a Worker secret, never in git, config or CI logs:** the user sets it (`wrangler secret put ALERT_TO_ADDRESS`; [manual step 20](MANUAL-SETUP-STEPS.md)) and Alchemy must leave it in place on deploy. Unset, `SpendLedger` sends nothing, so the shutdown drill and live acceptance should confirm it is set. Cloudflare delivers only to an address verified in Email Routing. No provisioning or real send in this slice.
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

2026-11-19 thumbnail placement: the folder check failed on the integrated baseline. The old path is now absent, the moved helper matches the original byte for byte and `InventorySlot.tsx` is its only importer. Reviewed the root, webapp, React and acceptance instructions and audited the folders and callers. `pnpm checks` passed lint, formatting, strict types and 3,467 tests with one existing audio render skipped. All 10 generated and built-in inventory criteria passed on production preview without retries.

2026-11-19 HUD acceptance cleanup: the HUD waits for the inventory icon and calls a focused screenshot reader that uses the shared colour matcher. Full repository checks and all 14 generated inventory, built-in inventory and pickup sound browser criteria passed. Reviewed root and acceptance instructions and checked the new helper’s folder and caller.

2026-11-19 generated HUD thumbnails: six browser criteria failed first on the old HUD. Removing only the outline failed all six contour checks with the fixture artwork still present. Final production preview passed 125 HUD, pickup, held-weapon and room artwork criteria without retries. `pnpm checks` passed lint, formatting, strict types and 3,338 tests with one existing slow audio test skipped. Re-read the root, webapp, React and acceptance instructions and checked folder layout and callers. Reviewed six native-size Chromium HUD captures.

2026-11-18 main sync: merged `6186476` into the ship worktree and resolved six conflicts. Verified 14 affected tests against main, preserving cases, assertions and helper bodies. `pnpm checks` passed lint, format, types and 2,838 tests with one existing slow audio render skipped. Properties passed 35/35, fake evals 170/170 and managed preview acceptance 293/293 on the first attempt. The managed wrappers logged errors at shutdown and both preview ports closed. Combined integration evidence is recorded in HANDOFF.md.
2026-11-18: Restored nested `const` functions and narrowed helper declaration lint to helpers outside function scopes. All 23 original definitions match the ship baseline. `pnpm checks` passes with 2,621 tests and one existing skip. Properties 14/14 and fake evals 170/170 passed. All browser criteria passed across runs, with timing failures detailed in [HANDOFF.md](HANDOFF.md#latest-ship-delivery).

2026-11-17 function standards: final `pnpm checks` passes lint/format/strict types and 2,618 tests (one existing slow render skipped); properties 14/14; fake evals 170/170; managed preview acceptance 256/256 without retries. Four final mutants fail the expected 6/5/7/1 criteria. All 1,292 inherited expect calls across 89 migrated test files are unchanged. Root/shared/engine/AI/API/webapp/React/audio/acceptance instructions reviewed; folder/caller audit lists 98 folders and counts 279 root files. No new helpers/types. Sandbox loopback EPERM required outside-sandbox checks and browser validation. Main advanced during the slice (observed `9026bcd`); sync and combined validation await an authorized commit of this delivery. No other worktree edits, commit, push, paid call or deploy.

Configuration review follow-up: prior standards claim missed mixed concerns, implicit environment dependencies and ternaries in the runner config. Entry point reduced to composition; pure preview/mode/port/server/runner modules use PascalCase filenames, @src imports and named types under types/. Numeric ports stay numeric; lifecycle options are shared within the server builder. New CI runner assertions and inherited preview assertions kill the retry mutant (one criterion) and Worker-port mutant (three relevant criteria). Targeted checks pass (28 tests, including 16 config checks); real online criteria 3/3 and occupied-port/external/interruption lifecycle checks pass after @src migration. Filesystem-directory regression observed red and fixed; module aliases are not used for filesystem paths. Final `pnpm checks` passes (lint/format/strict types, 2,586 tests, one existing slow audio render skipped). No index changes or commit.

2026-11-17 preview lifecycle: 256/256 criteria across four CI-shaped shards, no retries; combined HTML report built. Managed and external online scripts each pass all three privacy criteria. Occupied ports, partial startup failure, interrupted/normal teardown and external ownership verified. New config/report checks observed red; port mutation kills exactly one regression check. Standards/folder/caller audit complete against root, acceptance, shared and webapp instructions; no helpers/types extracted. Final `pnpm checks` passes: lint, formatting, strict types and 2,584 tests; one existing slow audio render skipped. Generated HTML/blob reports remain present. Evidence: `/private/tmp/gunsmith-ship-*.log`; no commit/push/deployment.

2026-11-17 free eval gate: `pnpm evals` passes 170/170, including arena fixtures; full `pnpm checks` passes (lint/format/types, 2,567 tests, one skipped) outside sandbox after sandbox audio stalled. Missing-command red observed; five unsafe command mutants rejected with a stub process; YAML/permissions, fourteen trigger-path probes, targeted formatting, diff whitespace and root/AI/shared standards/folder/caller review pass. No new helpers/types. Free workflow is committed in `e8ff270` and integrated at `f6039c8`; hosted Actions remains unverified. Integration independently repeated full checks and 170 fake criteria with conflicting inherited settings, plus 28 push/PR path probes. Paid selector/guard/dated samples remain AI-owned and pending; no paid execution or ledger initialization.

Cleanup verified: `pnpm checks` passes (2,250 tests, one slow audio render skipped); production compile passes with a chunk-size warning. Links/anchors, archive hashes and ignore behavior pass. Archive exclusion failed first and its removal kills exactly the new criterion. Root/shared/AI/engine/webapp/React/audio/acceptance standards and folder/caller audit complete. Cleanup is committed and integrated; no gameplay acceptance, paid eval, push or publication.

Integration delivery: code/assets `9d33c98`; full checks pass (2,567 tests, one existing slow render skipped), properties 14/14, fake evals 170/170, production-preview browser exit 0 (255 first-pass, one known `ShootingAcrossLevels` flake recovered). Source tips and merge hashes, conflict decisions, separate standards audit and preserved concurrent staging are in HANDOFF.md. No source checkout was written or synced. CI Worker startup and owner standards corrections remain open; hosted execution, model quality and audio re-render were not claimed.
