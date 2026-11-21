/**
 * Every sound the game plays, by its stable key (`docs/art/asset-manifest.md`): the file is under `files/`.
 * One-shots use MP3. The continuous ring-damage loop uses the approved WAV to avoid WebKit MP3 padding.
 * `sfx-empty-click` is `art`'s `empty-tight` (`webapp/audio/studies/empty-weapon-click/`). `sfx-damage-crunch` is the incoming-damage
 * crunch from `webapp/audio/studies/combat-feedback/damage-crunch.wav`, encoded the way the audio workspace does (`libmp3lame -q:a 2`). Pickup comes from
 * the audio workspace's encoded pack. The runtime cue recipes in `webapp/audio/README.md` cover footfalls, shots, reload and outgoing hits.
 */
export const SOUND_KEYS = [
  "sfx-empty-click",
  "sfx-damage-crunch",
  "sfx-hit",
  "sfx-ring-damage-loop",
  "sfx-pickup",
  "sfx-shot",
  "sfx-footstep",
  "sfx-reload",
] as const;
