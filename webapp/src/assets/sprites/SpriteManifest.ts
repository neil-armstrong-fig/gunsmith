import {PLAYER_RADIUS} from "@gunsmith/engine/player/PlayerRadius";
import type {SpriteEntry} from "@src/assets/sprites/types/SpriteEntry";
import type {SpriteKey} from "@src/assets/sprites/types/SpriteKey";

/** Art draws a standing body 18 pixels in radius (`docs/art/asset-reference/players/`); that is the size of the circle walls stop, whatever the picture. */
const BODY_RADIUS_PIXELS = 18;

/** Every player picture is 64 pixels square with the body's centre at (27, 32), and one scale: a crouched drawing is smaller, the circle walls stop is not. */
const PLAYER_SPRITE: SpriteEntry = {
  sizePixels: 64,
  anchor: {x: 27, y: 32},
  pixelsPerTile: BODY_RADIUS_PIXELS / PLAYER_RADIUS,
};

/** What the game knows of each picture, by key. */
export const SPRITE_MANIFEST: Record<SpriteKey, SpriteEntry> = {
  "sprite-player-stand-blue": PLAYER_SPRITE,
  "sprite-player-crouch-blue": PLAYER_SPRITE,
  "sprite-player-stand-orange": PLAYER_SPRITE,
};

/** Where a picture is served from: art's files live in `public/assets/sprites`, named by their key. */
export function spriteUrl(key: SpriteKey): string {
  return `/assets/sprites/${key}.svg`;
}
