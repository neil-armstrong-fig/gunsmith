# TODO: art (Session 3, art, text and audio, Codex)

Your checklist. The shared path is `TODO.md`; read it and `TODO-build.md` and `TODO-ai.md` first, every fresh session
(the sync protocol is at the top of `TODO.md`). Briefs are in `docs/art/`.

Write **only** under the asset folders named in `HANDOFF.md` (`webapp/public/assets/`, `docs/art/`). No code, no schemas,
no config. Style: clean flat vector, neon, geometric; blueprint touches suit the name. Desktop only.

## Resume here after clearing context (2026-11-12)

**State:** A1, six oddity explorations, the visual-schema proposal, sourced game research and the first audio
audition pack are delivered. The user prioritised sound/music: original local synthesis, industrial electronic,
with a driving soundtrack during play. Audio is art's next work ahead of top-down studies.
Build is on M1: a fun full-screen game, test-first, one mechanic at a time. The fuzzy frontend and pre-emptive shared
contracts were withdrawn. Do not restore them or assume older schema paths still exist. AI waits for real consumers.

**Decisions to preserve:**

- Industrial arena: slate, blue/orange teams with distinct stripes, flat geometric forms and sparse neon.
- Stairs are the only height transitions, visibly connecting both landings. No L1/L2/L3 text inside the arena.
- Terrain remains **dimly visible outside the cone**. The current cone reveals detail, players and items; walls/height
  occlude it. The **equipped weapon** defines its base angle/range; stance modifies it. Aim rotates it through 360°.
- Crouch extends range at the same angle and substantially slows movement; it also remains quieter/protected by cover.
- Arena finalisation follows resolved player/AI definitions. Check legal routes through stairs, spawn/pickup access and
  ring escape. Built-ins meet the same checks and must be deliberately authored/playtested.
- Central weighting for the strongest-rated weapon is a **proposal to test**, retaining randomness and fair routes.
- Art must be malleable to AI prompts, with many silhouettes rather than a fixed weapon catalogue. Development-time
  schema/renderer changes are allowed; generation changes only strict JSON, never executable code at runtime.

**Still open:** fixed modest defaults versus AI-selected weaknesses for unspecified weapon stats; exact balance numbers;
final visual grammar/asset manifest. Cone ownership and dim-map presentation are settled, not blockers.

**Next useful art work:** get listening feedback on `docs/art/concepts/audio/README.md` (match, menu and mixed
auditions), refine the mix and cues, then expand to 60-second menu and 90-second match loops. Add step variants and
recheck masking with build's weapon synthesiser. Production encoding and wiring await manifest/encoder review.
After the audio pack, translate the six oddities into top-down 64 px/32 px studies. Final sprites/tiles/UI still wait
for build's manifest. No runtime integration or generated-weapon synthesis belongs to art.

**References:** `docs/art/README.md` (current style/mechanics), `docs/art/concepts/industrial-arena.svg` and `.png`
(updated arena/vision sheet), `docs/art/concepts/prompt-built-oddities.md` and `.png` (six prompts, variants and limitations),
`docs/art/visual-schema-proposal.md` (future JSON visual grammar, not implemented), `docs/art/gameplay-research.md`
(nine sources, five playtests and user feedback). The oddities PNG is a profile-view identity study, not game sprites.

**Boundaries:** no runtime/schema/config edits by art; code belongs to build/AI. Update this checklist, art's row in
`TODO.md` and the delivery log in `HANDOFF.md`. Do not commit or push unless asked.

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
      `node-web-audio-api@2.2.0`. Source is in `docs/art/concepts/audio/src/`; no browser, Python, sampled material or model spend.
- [x] First audition: two 15-second / eight-bar industrial electronic sketches at 128 BPM (driving match, calmer menu),
      all 11 effect candidates from `docs/art/audio.md`, a mixed audition, listening guide and technical measurements.
      These are concepts using planned names, not registered manifest keys or files wired into the game.
- [x] Technical verification: 14 WAVs pass format/duration/headroom/decode checks; music passes three-repeat seams;
      re-render hashes match. A test-first Node integration test now covers the art tool; fresh listening remains separate.
- [x] Migration verified: all three header/crouch/determinism mutants killed; final `pnpm checks` green
      (274 engine tests, 78 webapp tests, 1 audio integration test). Shared config reused in the art tooling workspace.
- [ ] Listening review: three repeats of both music sketches, cue identity, fatigue and masking on headphones/speakers.
      Numerical continuity is checked; perceived quality is not signed off.
- [ ] Refine the mix/effects, add footstep variants; recheck combat masking with build's generated weapon-shot synth.
- [ ] After feedback, expand menu to 60 seconds and match to 90 seconds with seamless musical returns.
- [ ] Production: confirm manifest mappings, encode Ogg Vorbis + MP3, verify browser decoding/loop seams and hand off
      to build for test-first playback/ducking/volume integration. WAV masters do not prove compressed loops seamless.
      Weapon gunshots remain build/AI-owned synthesis; art supplies static cues only.

## A2: sprites. Milestone M3

- [ ] Review the visual-schema proposal with build/AI at M2; translate all six oddities into top-down compositions
      using only the agreed grammar and verify 64 px/32 px readability (`docs/art/visual-schema-proposal.md`).
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
