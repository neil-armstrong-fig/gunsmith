import {DUMMY_RADIUS} from "@gunsmith/engine/dummy/DummyRadius";
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

/** Art draws a practice dummy 64 pixels square with its centre at (32, 32) and a body 17 pixels in radius, which is the circle a bullet must touch (`DUMMY_RADIUS`). */
const DUMMY_BODY_RADIUS_PIXELS = 17;
const DUMMY_SPRITE: SpriteEntry = {
  sizePixels: 64,
  anchor: {x: 32, y: 32},
  pixelsPerTile: DUMMY_BODY_RADIUS_PIXELS / DUMMY_RADIUS,
};

/**
 * Art draws the rifle's shot 64 pixels square, travelling east, as a bar with its tip at (49, 32) (`docs/art/asset-reference/effects/projectile-rifle/`). The anchor is the tip,
 * not the picture's centre (32, 32): a bullet is a point that hits the moment it touches something, so the tip is where the bullet is. At the fighters' scale.
 */
const SHOT_SPRITE: SpriteEntry = {
  sizePixels: 64,
  anchor: {x: 49, y: 32},
  pixelsPerTile: PLAYER_SPRITE.pixelsPerTile,
};

/** What the game knows of each picture, by key. */
export const SPRITE_MANIFEST: Record<SpriteKey, SpriteEntry> = {
  "sprite-player-stand-blue": PLAYER_SPRITE,
  "sprite-player-crouch-blue": PLAYER_SPRITE,
  "sprite-player-stand-orange": PLAYER_SPRITE,
  "sprite-dummy": DUMMY_SPRITE,
  "fx-projectile-rifle-blue": SHOT_SPRITE,
  "fx-projectile-rifle-orange": SHOT_SPRITE,
};
