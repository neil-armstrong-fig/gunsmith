# Audio brief

Two kinds of sound, with different owners.

## 1. Weapon sounds: synthesised in the browser (not `art`'s job)

Each weapon has a `sound` block in its schema (`docs/schemas.md`), part of what the AI generates. The webapp turns it into
Web Audio (oscillators, noise, a filter, an envelope). `build` writes the synthesiser; `ai` fuzz-tests the limits. Every
parameter is clamped, and total duration, gain and voice count are limited, because a player influences these sounds.

## 2. Static sounds: pre-rendered files (`art`)

`art` supplies these files, named as the manifest says (`docs/art/asset-manifest.md`). Whether Codex can produce audio at all
is `(unverified)`; if it cannot, say so in the blockers section of `TODO.md` and brief another tool, using this file.

| Key | What | Notes |
| --- | ---- | ----- |
| `sfx-pickup`, `sfx-drop` | Picking up and dropping a weapon | Short, satisfying, metallic |
| `sfx-reload` | Reload | About 0.5 to 1 s; weapon-agnostic |
| `sfx-step-stand`, `sfx-step-crouch` | Footsteps | Loopable variants; crouch is quieter and softer |
| `sfx-hit`, `sfx-death` | You hit, you die | |
| `sfx-ring-warning` | The closing ring is about to start and while it closes | Rising tension |
| `sfx-ui-click` | Buttons | Very short |
| `sfx-round-start`, `sfx-round-end` | Stingers | |
| `music-loop-menu`, `music-loop-match` | Looping music | Seamless loops; calm menu, tense match; ducks under effects |

## Technical requirements

- Format: Ogg Vorbis plus an MP3 fallback. Mono for effects, stereo for music.
- Loudness: normalise effects to a consistent level, leave headroom; music about 6 dB below effects.
- Length: effects under 2 s except the ring warning; music loops of 60 to 120 s.
- Footsteps and other positional sounds are played with direction by the game; supply dry, centred mono files.
- Original or properly licensed only; record licences in `docs/art/README.md`.

## Audio and fog (design reminder)

A hidden opponent's sound reaches a player only as a direction in about 8 sectors, never a position, and only within hearing
range (`docs/match-netcode.md`). Crouching is quieter. Keep footsteps and weapon sounds distinct enough to read at a glance.
