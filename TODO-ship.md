# TODO: ship

Model: **Codex**. Follow the startup protocol in [TODO.md](TODO.md); read only relevant dependencies.

## Resume here

The persistent checkout is `.claude/worktrees/ship` on `worktree-ship`, fast-forwarded to `origin/main` at `1e486f8`. The current slice owns `.github/workflows/ci.yml`. After publication, verify that Checks reaches `pnpm checks`, all four preview shards finish and the combined HTML report is present.

The first combined Worker from `d40d942` is live on the API hostname. The locally verified two-host release reached GitHub main at `bc47751`. The webapp custom domain serves static test Worker version `8b2f62ff-f3f9-4e83-92c4-6cdc5d0ba93d` with `noindex`. The user deferred live rollout and automatic releases while Ship stabilizes CI.

Ship fixed the M1 pickup-marker acceptance setup. The [handoff](HANDOFF.md#latest-ship-delivery) records the original failing criterion, screenshot evidence and retained-marker check.

Production HUD wiring awaits AI and Engine's weapon-to-appearance association. When it lands, the first criterion should show that a generated weapon keeps its HUD drawing from creation through equip. Hosted CI runs; timing and release evidence live in [Operations](docs/agent-reference/Operations.md#ci-and-deployment). AI owns paid selector/guard/evidence and opening spend reconciliation.

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
- [x] Reproduce and fix the pickup-marker pixel failure on managed production preview.
- [x] Budget request: enforce declarations below callers, including tests; reject module-level const arrow/function helpers, preserving nested const functions. Full cleanup, no baseline.
- [x] Use the Worker manifest to bind `MATCHES`, `CREDITS`, `SPEND` and D1 in the deployed Worker. Retain the local `v1` and `v2` SQLite migrations. Alchemy manages deployed SQLite migrations.
- [x] Include `ALERT_MAIL` and `ALERT_FROM_ADDRESS` in the deploy config. Deploy-time `ALERT_TO_ADDRESS` setup and binding verification happen during the authorized deploy.
- [ ] Profile the next hosted sharded run against the failed [36-minute baseline](docs/agent-reference/Operations.md#ci-and-deployment). Record setup, build, test and report durations, retries, elapsed time and total runner minutes.
- [x] Settle eval policy with the user and deliver free fake CI/root mechanics; see [policy](docs/agent-reference/EvalPolicy.md).
- [ ] Receive AI-owned paid selector/guard/evidence implementation and reconciled opening spend before local paid activation.
- [ ] Validate the four single-worker preview shards and the combined report after the user commits and publishes the workflow. Review traces for repeatable gameplay failures and follow up with the owners.

## Later tasks

- [x] Implement the gated deploy and full live acceptance. Property checks remain independent, and AI owns its eval workflow.
- [ ] Verify the first Alchemy D1 and Worker deployment on production with `noindex`, then verify a GitHub redeploy preserves resources. Follow [First deploy](MANUAL-SETUP-STEPS.md#first-deploy).
- [ ] Before publication, scrub secrets/history, local settings, personal paths and addresses. No deploy, commit or push without the required authorization.
- [ ] Final tuning and case-study evidence, including the shutdown drill and real measurements.
- [x] Scaffold the infra package and its instructions. Keep the local Wrangler manifest and deployed Alchemy bindings aligned.
- [ ] Measure infrastructure costs with server/AI runtime measurements before proposing free versus Workers Paid.

## Verification/latest delivery

2026-11-20 CI stabilization: the pre-edit check found an unbounded native tool install. The revised step passed installed-tool, missing-tool and failed-APT probes. All 543 local production-preview criteria passed without retries. The four single-worker shards took 4.6, 6.3, 8.7 and 6.6 minutes in two waves, with a merged HTML report. The deadline probe failed with a valid partial blob. Workflow lint, `pnpm checks` (3,767 passed and one existing skip), both Wrangler dry runs and 275 fake evals passed. The next check is the hosted run after publication.

2026-11-20 hostname split: the cross-origin room request reached the old Worker with 201 but Chromium blocked the response. The new code passed all 37 online criteria. Chromium also opened a room directly between separate local Workers after a JSON preflight and received its joined WebSocket frame. The exact CI smoke passed on both local origins. Both Wrangler dry runs and workflow lint passed. The D1 upgrade preserved a fixture user and applied the new migration once. `pnpm checks` passed 3,738 tests with one existing audio skip. The managed wrappers logged shutdown errors after acceptance exited zero.

2026-11-20 production release setup: the build gate failed before `_headers` existed and then passed. The live CI check passed against a local Worker with migrated D1 and failed against a Vite preview missing the header. An SVG also carried `noindex`. `pnpm checks` passed lint, formatting, strict types and 3,646 tests with one existing audio skip. Production-preview acceptance passed 526 of 526 with no retries. The managed wrappers logged shutdown errors after the tests and the run exited zero. Workflow lint and Wrangler dry run passed.

2026-11-19 infrastructure review: split database provisioning, Worker deployment and release handling into subject folders. Alchemy declares the database and Worker directly. The routing mutation failed only the same-origin configuration test. GitHub Actions step spacing has been normalized across workflows and the composite action.

2026-11-19 release verification: `pnpm checks` passed 3,461 tests with the existing slow audio skip. All three deploy-config criteria failed against the scaffold and then passed. Actionlint and the complete/failed/missing shard-report probes passed. The Wrangler dry run bundled the Worker. The generated config served the release assets, queried migrated local D1 and passed all three WebSocket fog criteria. The two-worker preview run passed 496 of 500. Four workshop criteria failed while typing the prompt and all four passed twice in isolated reruns. The first hosted run after Engine's fix passed Checks before a newer main run superseded it. See [handoff](HANDOFF.md#latest-ship-delivery).

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
