# TODO: art (Session 3, art, text and audio, Codex)

Your checklist. The shared path is `TODO.md`; read it and `TODO-build.md` and `TODO-ai.md` first, every fresh session
(the sync protocol is at the top of `TODO.md`). Briefs are in `docs/art/`.

Work **only** under the folders named in `HANDOFF.md`: `webapp/public/assets/`, `docs/art/`, `webapp/audio/`.
The user authorised audio generators and their local tool config under `webapp/audio/`; game-runtime code, schemas
and shared config remain build-owned. Arena style: slate, neon, geometric; blueprint touches suit the name. Weapon concepts now explore chunky, shaded
cartoon sci-fi machinery at the user's request (Ratchet & Clank inspiration, adapted to overhead 2D). Desktop only.

## Resume here after clearing context (2026-11-14)

**Current milestone:** M1, a fun full-screen game, test-first. Build has delivered best-of-three on the duel;
next are play tuning and the remaining vision/ring mechanics. AI's later, uncommitted worktree checkpoint reports the
first local appearance-generation probe; art's authored-parts kit is now delivered. The committed weapon pipeline/eval DSL
has merged into main (`e40e9a1`); later appearance work remains in the worktree. Production contracts remain pending.
Read the current shared/persona TODOs and the AI worktree updates before acting.

**Art delivered:** authored kit 05 in `docs/art/concepts/weapon-parts-kit-05/`: 18 pieces,
12 kit-only recipes (six primaries plus six alternates), matching expanded JSON/SVGs, catalogue and
64/32 px/grayscale/held rotation reviews. User chose simple clear silhouettes and bounded choices.
`Assembly.md` specifies anchors, transforms and the proposed recipe interface; `README.md` records
identity limitations and unsupported requests. All earlier rich/simple references remain intact.
**User visual approval (2026-11-14): “looks really good”.** Preserve this kit as the approved
starting point; do not restart its direction or request the same approval again. Geometry passes;
AI selection/placement evaluation and runtime proof remain pending.
This is experimental art data, not an implemented renderer or frozen M2 contract.

**Latest audio preparation (2026-11-13):** compressed candidates and reproducible browser/native reports now exist.
Production is blocked by the measured duration/level/seam differences documented in `webapp/audio/README.md`.
The approved masters remain byte-identical. Do not repeat the direction audition or mark A6 production complete.

**Up next, in priority order:**

1. **Next art pass: read the latest AI worktree findings and shared handoff first.** The kit is visually
   approved. If a kit-selection probe has landed, review the actual generated assemblies and improve only
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
4. **Audio follow-up:** investigate recorded Ogg/MP3 duration, WebKit crouch-level and Vorbis seam failures, preserving
   masters. Encoding and browser/native QA tools are delivered; production approval, device/fatigue listening,
   masking with build's shot synth, final manifest mapping and playback integration remain pending.

**AI worktree review (2026-11-13; read-only, not copied or merged wholesale):**

- Source: `.claude/worktrees/ai-hosting-proof/docs/ai-visual-generation.md` plus its `TODO-ai.md`, `TODO-art.md`,
  `TODO.md` and `HANDOFF.md`. These contain newer AI findings but older build/audio status than main.
- AI reports 368 unit tests, 36/36 standing appearance criteria and 0/17 capability criteria; weapon evals 70/70.
  These are AI's reported results, not rerun by art. Appearance code is experimental and not wired into `generateWeapon`.
- Art should answer the questions about part budgets, anchors, palette roles and recipe vocabulary through the kit
  experiment. The proposed 24-part cap is unmeasured; stroke tolerance/pruning and call-budget policies remain open.
- Newer source note reports a user-reviewed Haiku run and later prompt fix (33/36 first answers valid).
  The old footer and some main status text are stale. No additional model call was made by art.
  Visual defaults do not settle gameplay-stat defaults.

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
`improbable-machinery-03.*`, `simple-machinery-04/`. Rich 02/03 PNGs are generated concepts. The simple 04 drawings are
original vectors; two image-generation attempts were rejected, and no raster result from them was delivered.

**Latest validation (2026-11-14, kit delivery):** root `pnpm checks` exits 0: lint, format,
strict typecheck and unit tests (516 engine, 152 AI, 127 webapp, 253 audio passed / one slow render skipped).
Twelve assembly/SVG comparisons, stroke-inclusive bounds and temporary AI-draft format conversions pass;
nine faulty recipes rejected; artifact hashes, local links and numeric anchor/grip checks pass.
Colour/grayscale/catalogue/held sheets inspected. User visually approved the kit (2026-11-14);
model-selection evaluation and runtime proof remain pending.
No gameplay suite or full audio re-render run for the kit. Earlier full master comparison and compressed
browser/native QA results remain as documented in the audio README; no audio files changed in this delivery.

**Boundaries:** art owns `docs/art/`, `webapp/public/assets/`, `webapp/audio/` and its checklist. Runtime/schema edits
belong to build/AI. The user explicitly authorised the visual-generation task addition to `TODO-ai.md`; leave its
implementation to AI. Re-read shared docs immediately before editing. No commit or push without being asked.
Update this checklist, art's status row and the handoff log after the next delivery.

## A1: palette and art direction. Milestone M1

- [x] `docs/art/README.md`: palette as named colour tokens (the webapp will use them as Tailwind `@theme` tokens), shape
      language, line weights, glow rules, and how fog, height levels and crouch should read. Team colours should differ
      without relying on red versus green alone (accessibility is out of scope for now, but do not make it harder later).
- [x] Concept sheet: the player (standing and crouched), the default rifle, three example custom weapons, a floor/wall/cover
      tile set, and a three-level arena mock.

*Delivered 2026-11-12: industrial arena direction and SVG/PNG concept sheet under `docs/art/`; visual and SVG checks passed.*

*Revised 2026-11-12: explicit stair flights with landings on both levels, no in-arena level text, forward-cone fog. Build/AI contract follow-up is in `HANDOFF.md`.*

*Extended 2026-11-12: longer crouch cone; prompt-malleable visual grammar; six generated oddity concepts with two variants each and documented prompt interpretations.*

## Research delivered to the game session

- [x] Source comparable designs and original visibility/generation references; submit five fixture-based playtests
      and concrete follow-up to build (`docs/art/gameplay-research.md`, 2026-11-12). No mechanics changed or models called.

- [x] Record research feedback: central weapon weighting proposal, substantial crouch slowdown, generated/built-in
      arena quality checks, and clarification that fog visibility updates as you look (2026-11-12).

- [x] Correct vision presentation and cone ownership: dim map outside, detailed terrain and players/items inside
      the rotating equipped-weapon/stance cone. Updated SVG/PNG and active design/handoff guidance (2026-11-12).

## A6: sound and music. Audition now (M1); production originally M4

User priority (2026-11-12): audio audition → full audio pack → top-down studies. Shared milestone order is unchanged.

- [x] Confirm local audio output; now converted to TypeScript/Node and regenerated with the user-approved dev-only
      `node-web-audio-api@2.2.0`. Source is in `webapp/audio/generator-scripts/`; no browser, Python, sampled material or model spend.
- [x] First audition: two 15-second / eight-bar industrial electronic sketches at 128 BPM (driving match, calmer menu),
      all 11 effect candidates from `docs/art/audio.md`, a mixed audition, listening guide and technical measurements.
      These are concepts using planned names, not registered manifest keys or files wired into the game.
- [x] Technical verification: 14 WAVs pass format/duration/headroom/decode checks; music passes three-repeat seams;
      re-render hashes match. A test-first Node integration test now covers the art tool; fresh listening remains separate.
- [x] Migration verified: all three header/crouch/determinism mutants killed; final `pnpm checks` green
      (274 engine tests, 78 webapp tests, 1 audio integration test). Shared config reused in the art tooling workspace.
- [x] User-directed relocation after the AI merge: generator source in `webapp/audio/generator-scripts/`, WAVs and
      measurements in `webapp/audio/generated-audio/`. CLI regeneration preserves all 14 WAV hashes; links and workspace
      registration updated. `pnpm checks` green (324 engine, 82 webapp, 67 AI, 1 audio test).
- [x] User audition approval (2026-11-12): "audio sounds good". Preserve the sound/direction; proceed to full tracks.
- [x] Expand menu to 60 seconds and match to 90 seconds, with composed variation and numerically verified loop returns.
- [x] Four footfalls per stance, including originals; fixed seeds, dry mono, same material, paired crouch at least 6 dB quieter in RMS.
- [x] User approves the expanded pack (2026-11-12): "Sounds great". Audio expansion complete; proceed to top-down concepts.
- [x] Production-preparation experiment (2026-11-13): 38 compressed candidates, exporter, native verification and
      Chromium/WebKit harness delivered under `webapp/audio/`. Master byte comparison passes. QA exposes release blockers;
      reports and reproduction commands are in its README. Encoding does not imply production approval.
- [ ] Resolve measured codec/browser issues before shipping: 13 native/Chromium Vorbis effect-duration failures;
      WebKit effect-duration differences, one crouch-level failure and two Vorbis music seam failures. Preserve masters.
- [ ] Before production, check fatigue and masking on headphones/speakers and with build's generated weapon-shot synth.
      The user's general approval does not claim this detailed listening protocol or in-game test has been completed.
- [ ] Production approval: resolve the delivered compressed candidates' failed native/browser checks, confirm manifest
      mappings and hand off to build for test-first playback/ducking/volume integration. WAV masters do not prove compressed loops seamless.
      Weapon gunshots remain build/AI-owned synthesis; art supplies static cues only.

## A2: sprites. Milestone M3

- [x] User-requested simpler version and provisional build brief: six matching JSON/vector compositions and actual-size
      reviews in `docs/art/concepts/simple-machinery-04/`. AI generation/defaults evaluation task added to `TODO-ai.md`.

- [x] **Plan phase first:** inspect the latest AI-worktree schemas and output shapes, including uncommitted work.
      Go back and forth between those drafts and the six concepts: let existing fields inform the visual studies,
      and propose the missing fields/vocabulary/examples the concepts need. Record findings and owner requests in
      `docs/art/visual-schema-proposal.md` / `HANDOFF.md`; drafts are provisional, not a frozen contract. Read the
      worktree's instructions first and leave AI/build-owned code to its owners.

- [x] **After planning:** twelve top-down oddity concepts (two per prompt) at 64 px / 32 px, using the visual-schema proposal provisionally;
      keep them in `docs/art/concepts/` and record grammar gaps. Final sprites still require M2 review and the manifest.

- [ ] Review the visual-schema proposal with build/AI at M2; translate all six oddities into top-down compositions
      using only the agreed grammar and verify 64 px/32 px readability (`docs/art/visual-schema-proposal.md`).
- [x] **Explore a kit of parts for prompt-built weapons (user request, 2026-11-13, from `ai`'s first probe).** The local model's
      free-form drawings did not come close to any prompt (AI worktree `docs/ai-visual-generation.md`), so the model should pick and place
      your authored parts instead of drawing coordinates, and code supplies the geometry. Explore, do not freeze: a small kit
      (roughly 10 to 20 parts: barrel, stock, body, lantern body, kettle spout, fax tray, lens, handle) where each part is a
      few primitives inside the 64 by 64 space, with named anchors (`grip`, `muzzle`, where the next part attaches), the
      parameters it takes (scale, flip, colour role, detail tier), and how parts attach. Then compose the six oddity prompts
      from the kit alone and record which prompts the kit cannot say and what should happen then. `ai` will probe whether a
      model can choose parts and parameters from it (the cheap local probe, then Haiku). Messages go through `HANDOFF.md` first.
*Delivered 2026-11-14: kit 05, 18 authored pieces, twelve assembly recipes, colour/grayscale/held reviews,
explicit unsupported identities and proposed handling. Twelve adapted drawings pass the current AI draft validator;
nine faulty recipes rejected. User visually approved the kit on 2026-11-14 (“looks really good”); model-selection probe remains open.*

- [ ] Player (standing and crouched, with a held-weapon variant per behavior class), default rifle, practice dummy.
- [ ] Pickup glows, projectiles and muzzle flashes per behavior, hit and death effects.

## A3: tiles. Milestone M3

- [ ] Floor, indestructible wall, penetrable cover, three height levels (edges and paired stairs), spawn and pickup markers, the
      closing ring's edge, the fog texture.

## A4: interface. Milestone M3

- [ ] HUD frames, weapon slot icons for 1 and 2, health and ammo, credit icon, buttons and panels, prompt-entry styling,
      the power-rating gauge, the pipeline-progress steps, the reveal screen frame.

## A5: copy. Milestone M4

- [ ] `docs/art/copy.md`: landing page, practice-arena and onboarding hints, prompt-entry help and **example prompts** (these
      also seed `ai`'s datasets; include some weak, some broken, some adversarial-looking-but-harmless), rejection and
      error messages, the AI-off banner, the credits explanation, legal pages (privacy and terms) matching
      `docs/privacy-and-data.md`.

## A7: brand. Milestone M6

- [ ] Logo, favicon set, social-preview image, README banner.

## A8: case study. Milestone M8

- [ ] Diagrams and illustrations for the case study (pipeline, the three cost layers, the eval loop).

## Always

- [x] After each delivery, add a line to the delivery log in `HANDOFF.md` listing the manifest keys delivered, so `build`
      can wire them in; then tick the row here.

**Context-clear checkpoint (2026-11-14):** kit 05 visually approved; next action is the AI
selection/placement comparison, with art responding to observed failures. Audio codec QA is art's
independent next task while waiting. M2, production sprites and manifest integration stay open.
No commit, paid run, production-schema choice or new dependency is authorised by this checkpoint.
