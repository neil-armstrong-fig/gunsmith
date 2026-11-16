## Earlier context-clear checkpoint (2026-11-14)

**Current milestone:** M1, a fun full-screen game, test-first. Build has delivered
best-of-three and now the first aim-rotated forward-cone slice (latest `HANDOFF.md`:
cone/wall filtering and dim veil; crouch and heights are not done). Re-read build's
current checklist rather than treating old status counts as current. AI's committed
weapon pipeline/eval DSL is in main (`e40e9a1`); later appearance work and findings
remain in `.claude/worktrees/ai-hosting-proof/`. M2/manifest contracts remain open.
Art's kit 05 and Haiku review 06 are delivered; the user accepted this review
(“great”, 2026-11-14) and asked for a context-clear checkpoint.

**Art delivered:** authored kit 05 in `docs/art/concepts/weapon-parts-kit-05/`: 18 pieces,
12 kit-only recipes (six primaries plus six alternates), matching expanded JSON/SVGs, catalogue and
64/32 px/grayscale/held rotation reviews. User chose simple clear silhouettes and bounded choices.
`Assembly.md` specifies anchors, transforms and the proposed recipe interface; `README.md` records
identity limitations and unsupported requests. All earlier rich/simple references remain intact.
**User visual approval (2026-11-14): “looks really good”.** Preserve this kit as the approved
starting point; do not restart its direction or request the same approval again. Geometry passes;
AI selection/placement evaluation and runtime proof remain pending.
This is experimental art data, not an implemented renderer or frozen M2 contract.

**Investigation tooling removed (2026-11-14, user request):** the alignment
runner, helper, types and tests are deleted. Frozen measurements/build handoff
and existing codec QA remain. Source hashes are marked historical. Future
playback fixes should carry focused regressions in build's implementation.
Removal verified: root pnpm checks passes; audio 254 pass, one slow render
skipped. Evidence/audio hashes and folder/caller standards review pass.

**Alignment diagnosis delivered (2026-11-14):**
`webapp/audio/qa/webkit-alignment/README.md` freezes 76 browser/file measurements,
fresh native/browser QA and preservation hashes. Nine synthetic tests cover
sample alignment; three mutation probes killed (the two ambiguity guards were
removed together). Informative WebKit windows show −128 frames in 15 Vorbis
files and +576 in 11 MP3 files; ambiguous/quiet windows remain inconclusive.
Native/Chromium still pass 38/38, WebKit still has 23 failing candidates.
Build owns reproduction in the eventual playback path and any timing correction.
Art's diagnostic slice is complete; production, listening and manifest work stay open.
Final root checks pass: lint, formatting, strict types; 630 engine, 419 AI,
160 webapp and 263 audio tests (one slow render skipped). Folder/caller and
standards review completed; no gameplay acceptance suite or model eval run.

**Latest audio follow-up (2026-11-14):** the Ogg page-duration fix is delivered;
native/Chromium pass all 38 candidates. WebKit retains 23 failing candidates
(17 MP3 durations, four Vorbis durations, two music seams). Crouch levels now pass.
Masters and MP3 hashes are unchanged. See `webapp/audio/qa/ogg-pages/README.md`
for evidence and build's playback/format handoff. Keep production blocked.
AI appearance work is now merged into main (`c8269cf`); later worktree changes
are paid-model plumbing, with no new drawings at this checkpoint. Review 06 inputs
still match their frozen hashes. Preserve kit/player concepts; no player-style
TODO addition was requested after the user inspected the SVG.

**Haiku review delivered and accepted (2026-11-14):**
`docs/art/concepts/haiku-review-06/README.md` reviews the twelve saved outputs,
with editable comparison sheets, native-size/grayscale/detail comparisons and
96 provisional held stamps. Frozen evidence separates the 00:17 drawing snapshot
(11 valid, one fallback) from the newer eval summary and AI-reported 36-trial run.
Duck/cactus identity, disappearing fine cues, lantern evidence and pose/contrast
are prioritised for AI/build. This completes the annotated review only; no new
model call, revised fixture or production approval. Kit 05 approval is preserved.

**Up next, in priority order:**

1. **Next art pass: read the latest AI worktree findings and shared handoff first.** The kit is visually
   approved; review 06 is complete. Do not repeat it against the same twelve saved drawings.
   If new primitive/kit outputs or renderer feedback have landed, review those and improve only
   demonstrated identity/attachment failures; retain the approved examples as comparison fixtures.
   If no probe or owner request is available, continue the recorded audio codec/browser blockers instead:
   read `webapp/audio/AGENTS.md` and the current QA reports, reproduce a failure test-first, preserve
   every approved WAV master, and keep production blocked until the measured failures are resolved.
2. **AI next: selection/placement probe against the approved kit 05.** Read its `README.md`,
   `Parts.json`, `Assembly.md`, `recipes/` and `RejectedRecipes.json`. Probe the original six prompts
   plus sparse/unsupported/conflicting requests; report validity AND recognisable identity, variation,
   tokens, latency, repairs and disclosed stand-ins. Art does not implement AI code or run paid calls.
   Compare against the existing primitive arm before choosing an approach. Local primitive results were weak, but the
   newer worktree Haiku report records 33/36 strict first answers after its prompt fix (one repaired,
   two lantern stand-ins); the user's first Haiku review was “way better, already nearly usable”.
   Those are AI-reported results, not rerun by art. Compare approaches; do not assume the kit wins.
3. **Build:** when generated visuals are needed, prove one generic renderer test-first (lantern, fax, kettle), checking
   held size, rotations, team/fog boundaries and gameplay separation. Final sprites/tiles/UI await M2 and the manifest.
4. **Audio follow-up:** build owns the remaining WebKit playback/format decision; reproduce its
   four Vorbis effect-duration, 17 MP3 effect-duration and two Vorbis seam failures, preserving masters. Encoding and browser/native QA tools are delivered; production approval, device/fatigue listening,
   masking with build's shot synth, final manifest mapping and playback integration remain pending.

**AI worktree / evidence checkpoint (2026-11-14):**

- Read the worktree's current `docs/ai-visual-generation.md`, TODO and handoff
  changes read-only. Its build/audio history is older than main. Do not merge,
  copy its docs wholesale, or trust stale “not done / no Haiku” footers.
- Review 06 freezes the twelve 00:17 UTC drawings (11 valid, one lantern fallback),
  separately from the 00:32 summary (50/53 criteria) and AI's reported 36-trial
  run (33 first-valid, one repaired, two fallbacks). No correspondence is proved.
  Reuse `Provenance.json`, `Verification.json` and `evidence/`; never replace these
  snapshots with a newer `latest` file. Kit selection/placement is still unmeasured.
- AI follow-up: duck/cactus identity, structural detail labels, and retained
  lantern first/repair/final drafts with run/trial IDs. Build follow-up: generic
  renderer pose/muzzle alignment, contrast, team cues and real fog boundaries.
  Both owner requests are in `TODO.md` and review 06. Art does not edit their code.
- Historical local-tier scores and Haiku results do not transfer between tiers.
  Visual defaults do not decide omitted gameplay stats. No new model call was
  made by art; this checkpoint authorises no paid run or tolerance/budget change.

**Decisions to preserve:**

- Industrial slate arena; blue/orange teams with one/two stripes. Weapon concepts can use chunky cartoon machinery
  and simple shaded depth; the simpler flat compositions are an implementation experiment, not a final style ruling.
- Stairs are the only height transitions, with landings on both levels. No L1/L2/L3 text in the arena.
- Known terrain stays dim outside the aim-rotated cone; detail/entities appear inside, subject to wall/height occlusion.
  Equipped weapon supplies the base cone, stance modifies it. Crouch extends range at the same angle and slows movement
  substantially; quieter movement and cover protection remain part of the tradeoff.
- Arena finalisation checks stair routes, spawn/pickup access and ring escape for generated and built-in arenas alike.
  Weighting the strongest-rated weapon toward contested central space remains a playtest proposal.
- Generated visuals stay malleable to prompts; fixed code interprets validated JSON. Cosmetics never add gameplay or
  expose hidden entities. Runtime-generated executable code is excluded. Omitted gameplay-stat policy is still open.

**Approved audio:** full pack 02, 60-second menu / 90-second match, four footfalls per stance, industrial electronic
128 BPM / D minor. User approved it ("Sounds great"); do not restart expansion or request another direction audition.
Source: `webapp/audio/generator-scripts/`; output: `webapp/audio/generated-audio/`; guide: `webapp/audio/README.md`.
Commands: `pnpm --filter @gunsmith/audio-studies render` / `... checks` (about a second) / `... test:render` (renders the whole
pack; latest run took about eleven minutes, and requires every file byte for byte the same as `generated-audio/`; not in `checks`).
The code was restructured by `build` on 2026-11-13 with the audio unchanged; read `webapp/audio/AGENTS.md` before editing it.
General approval does not claim production integration QA.

**References:** `docs/art/README.md`, `docs/art/visual-schema-proposal.md`, `docs/art/gameplay-research.md`, and
`docs/art/concepts/`: `industrial-arena.*`, `prompt-built-oddities.*`, `top-down-oddities/`, `overhead-machinery-02.*`,
`improbable-machinery-03.*`, `simple-machinery-04/`, `weapon-parts-kit-05/`, `haiku-review-06/`. Rich 02/03 PNGs are generated concepts. The simple 04 drawings are
original vectors; two image-generation attempts were rejected, and no raster result from them was delivered.

**Latest completed validation (context-clear pass, 2026-11-14):** root `pnpm checks`
exited 0 outside the sandbox: lint, format, strict typecheck; 559 engine, 152 AI,
133 webapp and 253 audio tests passed, one slow audio render skipped. The earlier
review's `Verification.json` retains its own 558-engine/132-webapp checkpoint.
That earlier sandboxed run stalled in local-server audio tests; its replacement
passed and the stalled process was stopped. No server started by art remains.
Documentation/folder review and diff whitespace checks pass. Artifact checks passed: frozen
hashes, SVG safety, 72 source-faithful Haiku samples, six full-size kit comparisons,
96 held transforms, PNG dimensions and README links. All three sheets inspected.
No gameplay acceptance, paid/local model eval or full audio re-render was run.
Review verification used `/tmp` authoring/QA scripts; do not assume they survive
context clear. The shipped SVGs and frozen evidence are the review source.
Earlier kit and audio verifications remain with their own deliveries.

**Boundaries:** art owns `docs/art/`, `webapp/public/assets/`, `webapp/audio/` and its checklist. Runtime/schema edits
belong to build/AI. The user explicitly authorised the visual-generation task addition to `TODO-ai.md`; leave its
implementation to AI. Re-read shared docs immediately before editing. No commit or push without being asked.
Update this checklist, art's status row and the handoff log after the next delivery.


**Audio delivery validation (2026-11-14):** root checks passed (570 engine, 394 AI,
139 webapp, 254 audio; one slow audio check skipped); audio checks passed after
moving the one-caller shim beneath verification. Full master render passed in
321 seconds, all 21 files byte-identical. Native/Chromium 38/38; WebKit 23 failing
candidates retained in the report. Two browser negative controls per engine pass;
flag-removal mutation reproduces the two duration regressions. Folder/caller and
standards audit completed. No runtime acceptance suite or model call by art.

