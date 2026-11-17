/**
 * Every sound the game plays, by its stable key (`docs/art/asset-manifest.md`): the file is `files/<key>.wav`. They are
 * plain WAV, not a compressed copy, because the compressed ones still fail the WebKit checks (`TODO.md`) and these are a
 * few kilobytes each. `sfx-empty-click` is `art`'s `empty-tight` (`webapp/audio/studies/empty-weapon-click/`).
 */
export const SOUND_KEYS = ["sfx-empty-click"] as const;
