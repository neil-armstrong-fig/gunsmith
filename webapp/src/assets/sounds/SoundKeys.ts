/**
 * Every sound the game plays, by its stable key (`docs/art/asset-manifest.md`): the file is `files/<key>.mp3`.
 * MP3 is the user-approved production format; WAV masters remain in the audio workspace.
 * `sfx-empty-click` is `art`'s `empty-tight` (`webapp/audio/studies/empty-weapon-click/`). `sfx-damage-crunch` is the incoming-damage
 * crunch from `webapp/audio/studies/combat-feedback/damage-crunch.wav`, encoded the way the audio workspace does (`libmp3lame -q:a 2`).
 */
export const SOUND_KEYS = ["sfx-empty-click", "sfx-damage-crunch"] as const;
