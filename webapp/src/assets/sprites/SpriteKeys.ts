/**
 * Every picture the game draws, by the stable key art names it with (`docs/art/asset-manifest.md`): the file is
 * `public/assets/sprites/<key>.svg` for sprites and `public/assets/tiles/<key>.svg` for terrain. A team has its own file for each stance, blue with one stripe and orange with two, so a key ends in its team.
 * The opponent never crouches, so it has a standing picture only. A shot has one file for each side too, in that side's colour; the opponent's orange is
 * a build stand-in (blue with the fill changed) until `art` draws it.
 */
export const SPRITE_KEYS = [
  "sprite-player-stand-blue",
  "sprite-player-crouch-blue",
  "sprite-player-stand-orange",
  "sprite-rifle-default",
  "sprite-marksman-rifle",
  "sprite-submachine-gun",
  "sprite-dummy",
  "sprite-pickup-marker",
  "fx-projectile-rifle-blue",
  "fx-projectile-rifle-orange",
  "tile-floor-l1",
  "tile-floor-l2",
  "tile-floor-l3",
  "tile-wall",
  "tile-low-cover",
] as const;
