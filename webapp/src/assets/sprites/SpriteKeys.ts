/**
 * Every picture the game draws, by the stable key art names it with (`docs/art/asset-manifest.md`): the file is
 * `public/assets/sprites/<key>.svg`. A team has its own file for each stance, blue with one stripe and orange with two, so a key ends in its team.
 * The opponent never crouches, so it has a standing picture only.
 */
export const SPRITE_KEYS = [
  "sprite-player-stand-blue",
  "sprite-player-crouch-blue",
  "sprite-player-stand-orange",
  "sprite-dummy",
] as const;
