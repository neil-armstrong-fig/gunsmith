# TODO: art (Session 3, art, text and audio, Codex)

Your checklist. Follow the startup protocol in `TODO.md`; read the current resume section and the tasks you are taking on. Other persona checklists are references when a dependency requires them. Briefs are in `docs/art/`.

Work **only** under the folders named in `HANDOFF.md`: `webapp/public/assets/`, `docs/art/`, `webapp/audio/`.
The user authorised audio generators and their local tool config under `webapp/audio/`; game-runtime code, schemas
and shared config remain build-owned. Arena style: slate, neon, geometric; blueprint touches suit the name. Weapon concepts now explore chunky, shaded
cartoon sci-fi machinery at the user's request (Ratchet & Clank inspiration, adapted to overhead 2D). Desktop only.

## Art/research session 1 checkpoint (2026-11-16)

Fair-arena research is delivered below. Next: review new build/AI validator or
playtest evidence against the brief; do not repeat the desk study. Matching spawn
pairs and unchanged random ring centres are confirmed. No runtime/schema work or
paid probe belongs to this handover. M2 production assets and audio playback QA
remain open with build. Research 2's stat-balancing work is separate.

## Next: user-requested studies and assets (2026-11-15)

- [x] **Art/research pivot:** sourced anti-cheat, account farming, match recording,
      reporting, silent restricted queues and open-source recommendations in
      [fair-play research](docs/art/fair-play-research.md). User chose sign-in for
      public play, participant/moderator replays with either-player sharing,
      automatic corroboration plus human override, clean-match-only recovery and
      a minimal 90-day post-deletion restriction record. Design/privacy/setup and
      shared handoff reconciled. Runtime remains build/AI work with online play;
      no detector, schema, code, infrastructure or paid call was added.

- [x] **Aim reticle:** [precision crosshair and build handoff](docs/art/concepts/aim-reticle/README.md)
      delivered 2026-11-16: SVG, transparent 32/64 px PNGs, native-size and
      colour/grayscale context sheet. Static aim marker, hotspot (16,16).
      User visual review and build integration remain open; no production key.
- [x] **Taking damage and game juice:** [build handover](docs/art/concepts/combat-feedback/Handover.md)
      complete (2026-11-16). User chose punchy/crunch and retained shake for build
      to tune. Minimal handover keeps four art files plus selected crunch/source/
      tests. Review artifacts, prototype tooling and unselected thud removed;
      selected effects/audio unchanged. Build owns event/manifest and runtime
      integration, aiming during shake, codec/playback and weapon-shot masking.
- [x] **Empty-weapon click handover complete:** [selected tight click and build brief](docs/art/concepts/empty-weapon-click/README.md),
      2026-11-16. User chose `empty-tight`, superseding the heavier alternative,
      and will tune it in game. Once per continuous hold. Selected master/source/
      tests retained; alternate and A/B preview scaffolding removed. Build owns
      event/manifest agreement (`sfx-empty-click` proposed), masking and integration.
      No further art audition blocks build; approved pack unchanged.
      Renderer regressions cleaned into six focused tests; project checks pass.
- [x] **Fair, symmetrical arenas:** study how generation can prevent a starting
      high-ground advantage. Require symmetrical arena geometry, heights, cover
      and stair access, with equivalent spawn opportunities; weapon placement
      remains random. Compare legal routes to high ground, sightlines, choke
      points and ring escape, and test with player/spawn assignments swapped.
      Recommend a symmetry approach and deterministic finalisation/validation checks
      for build/AI, applying the same fairness standard to built-in arenas.
      Delivered by art/research session 1, 2026-11-16:
      [research, measured fixtures and build handover](docs/art/arena-fairness-research.md),
      with an editable four-arena SVG/PNG sheet. Recommend rotation and shared
      high ground first. User confirmed matching spawn pairs and unchanged random
      ring centres; weapons remain random. Structural checks, ring diagnostics
      and future paired playtests are separate. Runtime/validation/playtesting
      belong to build/AI; no production schema or manifest key is frozen.

- [ ] **Inventory display (user request, 2026-11-16):** investigate how the HUD
      should show which guns the player has. Today `ui-slot-1` and `ui-slot-2`
      (`docs/art/asset-reference/interface/`) show the same generic silhouette in
      both slots, and the blue outline marks selection, not ownership. Study a
      per-weapon icon (the rifle, the marksman rifle, the picked-up submachine gun,
      later prompt-built weapons, which must stay prompt-malleable and bounded) and
      how a slot reads when it holds a different weapon, is empty, is selected, is
      reloading or is out of ammunition. Judge it at game scale beside the ammo
      readout and in grayscale, keep it compact so it does not cover the arena, and
      say what build would need to report (a weapon name or icon key per slot in the
      state hook). Recommend an approach; no manifest key or runtime change from art.

Art supplies examples/studies; build owns runtime, generation constraints and
engine validation, with AI consuming the agreed constraints. These are queued
items, not implemented mechanics or new production manifest keys.

## Resume here: build asset reference delivered (2026-11-14)

- [x] User-requested complete build-facing asset guide: five SVG/PNG sheets,
  80 individual SVG examples, raster effect/brand previews and approved audio
  links in `docs/art/asset-reference/README.md`. Covers every planned manifest
  family plus stairs and A4/A7 component examples. Final keys/sizes remain M2.
- Native-size/grayscale and held poses reviewed; dimensions, links, SVG safety,
  coverage and preservation verified. No runtime assets or code were installed.
  Final root checks pass: lint/format/types, 679 engine, 420 AI, 179 webapp,
  254 audio tests; one slow render skipped. Folder/reference review complete.
- AI's later kit probe is complete: user preferred the shapes arm and shelved
  kit generation; worktree `be6b913` retains findings after probe code removal.
  Preserve kit 05 as approved authored reference; do not restart its model probe.
- Build has crouch and basic stairs; remaining height rules and ring are its M1
  work. AI owns lantern bounds and appearance integration. Art next supports
  concrete renderer/manifest feedback using this reference pack. Audio playback,
  fatigue/masking and production approval remain open with build.
- Reference delivery does not complete A2–A4 production files or A7 final branding.
  See `docs/art/asset-reference/Verification.md` for validation and limitations.

## Earlier context-clear checkpoint

Historical session context: [archive](docs/history/ArtCheckpoints.md). Read only when relevant to the task.

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
- [x] Fix native/Chromium Vorbis durations test-first with 20 ms pages; verify all 38
      candidates, preserve masters/MP3 hashes, and mutation-prove the regression (2026-11-14).
- [x] Deliver reproducible per-channel sample-alignment diagnosis and frozen build handoff,
      retaining Ogg/MP3 and preserving all masters/exports (2026-11-14).
- [ ] Resolve remaining WebKit playback/format blockers with build: 17 MP3 effect
      durations, four Vorbis effect durations and two Vorbis music seams. Crouch levels pass.
      Evidence and reproduction: `webapp/audio/qa/ogg-pages/README.md`. Preserve masters.
- [ ] Before production, check fatigue and masking on headphones/speakers and with build's generated weapon-shot synth.
      The user's general approval does not claim this detailed listening protocol or in-game test has been completed.
- [ ] Production approval: resolve the delivered compressed candidates' failed native/browser checks, confirm manifest
      mappings and hand off to build for test-first playback/ducking/volume integration. WAV masters do not prove compressed loops seamless.
      Weapon gunshots remain build/AI-owned synthesis; art supplies static cues only.

## A2: sprites. Milestone M3

- [x] User-selected Haiku review (2026-11-14): annotate all twelve saved drawings,
      compare the six oddities to approved kit 05 at 64/32 px and in grayscale,
      show both detail variants and 96 provisional held stamps, freeze evidence
      and hand AI/build observed identity, pose and contrast failures. See
      `docs/art/concepts/haiku-review-06/README.md`. No corrected fixtures or model run.


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

**Context-clear checkpoint (2026-11-14):** review 06 is delivered and accepted;
kit 05 remains visually approved. Next art action is new-output/renderer review
if owner evidence is available, otherwise audio codec QA with masters preserved.
Production art, M2/manifest agreement and kit-selection evaluation remain open.
Shared TODO/handoff updated; leave existing staging to the user. No commit,
paid call, dependency or production contract change is authorised here.

**Next-session prompt:** “You are art, continue TODO-art.md. Read the context-clear
checkpoint and current AI worktree changes first. Preserve approved kit 05 and
completed Haiku review 06; use new owner evidence, otherwise continue audio codec QA.”
