# TODO: art (Session 3, art, text and audio, Codex)

Your checklist. The shared path is `TODO.md`; read it and `TODO-build.md` and `TODO-ai.md` first, every fresh session
(the sync protocol is at the top of `TODO.md`). Briefs are in `docs/art/`.

Write **only** under the asset folders named in `HANDOFF.md` (`webapp/public/assets/`, `docs/art/`). No code, no schemas,
no config. Style: clean flat vector, neon, geometric; blueprint touches suit the name. Desktop only.

**What you are waiting for from `build`:** the asset manifest (stable keys, sizes, formats, placeholders). **A1 needs
nothing and can start immediately.** Until the manifest exists, make concept sheets, not final files.

**What the others need from you:** a review of the manifest before it freezes (Milestone M2), example prompts for `ai`'s
datasets (A5), and final files named exactly as the manifest says.

## A1: palette and art direction. Milestone M1

- [ ] `docs/art/README.md`: palette as named colour tokens (the webapp will use them as Tailwind `@theme` tokens), shape
      language, line weights, glow rules, and how fog, height levels and crouch should read. Team colours should differ
      without relying on red versus green alone (accessibility is out of scope for now, but do not make it harder later).
- [ ] Concept sheet: the player (standing and crouched), the default rifle, three example custom weapons, a floor/wall/cover
      tile set, and a three-level arena mock.

## A2: sprites. Milestone M3

- [ ] Player (standing and crouched, with a held-weapon variant per behavior class), default rifle, practice dummy.
- [ ] Pickup glows, projectiles and muzzle flashes per behavior, hit and death effects.

## A3: tiles. Milestone M3

- [ ] Floor, indestructible wall, penetrable cover, three height levels (edges and ramps), spawn and pickup markers, the
      closing ring's edge, the fog texture.

## A4: interface. Milestone M3

- [ ] HUD frames, weapon slot icons for 1 and 2, health and ammo, credit icon, buttons and panels, prompt-entry styling,
      the power-rating gauge, the pipeline-progress steps, the reveal screen frame.

## A5: copy. Milestone M4

- [ ] `docs/art/copy.md`: landing page, practice-arena and onboarding hints, prompt-entry help and **example prompts** (these
      also seed `ai`'s datasets; include some weak, some broken, some adversarial-looking-but-harmless), rejection and
      error messages, the AI-off banner, the credits explanation, legal pages (privacy and terms) matching
      `docs/privacy-and-data.md`.

## A6: static sounds. Milestone M4

- [ ] `docs/art/audio.md` is the brief. Pickup, drop, reload, footsteps (standing and crouched), hit, death, ring warning,
      UI, round start and end, and a music loop. Weapon gunshots are **not** yours: they are synthesised in the browser from
      the weapon's `sound` block.
- [ ] Confirm that Codex can output audio at all (unverified). If not, say so in `TODO.md`'s blockers and brief another tool.

## A7: brand. Milestone M6

- [ ] Logo, favicon set, social-preview image, README banner.

## A8: case study. Milestone M8

- [ ] Diagrams and illustrations for the case study (pipeline, the three cost layers, the eval loop).

## Always

- [ ] After each delivery, add a line to the delivery log in `HANDOFF.md` listing the manifest keys delivered, so `build`
      can wire them in; then tick the row here.
