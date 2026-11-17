# Empty-magazine click / build handover

Ready for build. **User selected `empty-tight` (2026-11-16)** and will tune it in
the game. No further art audition is needed before integration.

## Selected asset

Use [empty-tight.wav](../../../../webapp/audio/studies/empty-weapon-click/empty-tight.wav):
70 ms, dry mono 48 kHz / 16-bit PCM, peak −6.02 dBFS, RMS −25.93 dBFS.
SHA-256: `c1ea912790b70b571f229488f641ed81082305a2d673cb1f4bf7b95622c5188f`.
The selected bytes are unchanged from the audition. Original local synthesis;
no baked panning or reverb. [Measurements](../../../../webapp/audio/studies/empty-weapon-click/measurements.json)
record technical results; the tool's generic listening-review field is not the
approval record. This handover records the user's choice.

Production key: `sfx-empty-click`, integrated and now shipped as MP3 at the
user’s request. `empty-tight` remains the selected master identifier. Build owns
future playback integration. The original approved pack is unchanged; existing WebKit codec
findings remain open. Weapon-shot masking and final gain need checking in game.

## Behaviour to implement, test first

- Play only for the local player during an active round when an otherwise eligible
  firing attempt fails because the equipped magazine is empty. Reserve ammunition
  does not affect eligibility. No opponent ammunition or hidden-position disclosure.
- Play **once per continuous trigger hold**, including when held fire drains the
  magazine. Wait for the normal firing cooldown to expire; do not click alongside
  the last successful shot. Release and press again rearms the click.
- Switching weapons or completing reload while held does not rearm it. A loaded
  weapon may fire normally, but the hold still permits at most one empty click.
- Suppress empty clicks during reload/cooldown, UI interaction and round overlays.
  Focus loss, death and round reset cancel pending sound/input; require a fresh
  press on return. Never trigger per simulation tick or HUD update.

Agree the minimum event and manifest contract in HANDOFF before runtime work.
Keep presentation state out of the World-only game store and deterministic rules.
Acceptance should cover held depletion, empty press/release/repress, spare versus
no reserve, switching/reload while held, UI/cooldown suppression and cancellation.
Use actual firing eligibility, not rounded HUD ammunition or a silent frame.
Run project checks and relevant game acceptance specs; mutation-prove coverage.

## Source and verification

Recipe: `webapp/audio/generator-scripts/generators/effects/empty-click/MakeEmptyClick.ts`.
The separate renderer writes the selected WAV and measurements only:

```sh
pnpm --filter @gunsmith/audio-studies exec node generator-scripts/studies/empty-weapon-click/RenderEmptyWeaponClick.ts
```

Keep the selected master, recipe, renderer and its regression tests for later
in-game tuning. The heavier alternative and A/B HTML/JSON/playback scaffolding
were removed after selection. No runtime implementation or shared schema is
included. Historical audition/browser results remain in the delivery log.

Tests verify deterministic renders, exact selected-master agreement, format,
duration, audible headroom and quiet tails. Final cleanup checks and pack
preservation results are recorded in HANDOFF. Tune deliberately during build;
update the master and measurements together if the sound changes.
