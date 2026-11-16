# Combat feedback handover

Start with [Handover.md](Handover.md). The user chose **punchy / crunch** and
asked to retain the current camera shake for adjustment during build.

- [Study.html](Study.html): frozen, self-contained working reference. Open it in
  a browser, enable sound and press Replay. No server is needed.
- [Study.json](Study.json): the selected treatment's cue table, timings and profile;
  study data, not a production schema.
- [Handover.md](Handover.md): assets, decisions, integration order, acceptance
  criteria, remaining work and a Claude resume prompt.

The HTML includes its script, data and audition audio. Separate prototype build
scripts, templates, screenshots, measurement duplicates and review notes were
removed after the art decision. Implement in the game from the handover; do not
turn the scripted prototype into runtime code.

The selected [crunch WAV](../../../../webapp/audio/studies/combat-feedback/damage-crunch.wav)
and its source generator, renderer, tests and audio measurements remain in
`webapp/audio/`. The unselected thud and its recipe were removed; output-set
tests now require only crunch. The frozen HTML retains its embedded original
comparison. Follow [the audio instructions](../../../../webapp/audio/AGENTS.md)
for intentional regeneration. Current effect settings and audio are unchanged.
