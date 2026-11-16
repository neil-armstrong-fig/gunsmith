import {readFileSync} from "node:fs";
import {DUMMY_RADIUS} from "@gunsmith/engine/dummy/DummyRadius";
import {PLAYER_RADIUS} from "@gunsmith/engine/player/PlayerRadius";
import {expect, it} from "vitest";
import {SPRITE_KEYS} from "@src/assets/sprites/SpriteKeys";
import {SPRITE_MANIFEST} from "@src/assets/sprites/SpriteManifest";
import {spriteUrl} from "@src/assets/sprites/SpriteUrl";

/** The file `spriteUrl` points at, read from `public/`, which the dev server and the build serve from the site's root. */
function fileOf(url: string): string {
  return readFileSync(new URL(`../../../public${url}`, import.meta.url), "utf8");
}

it("knows every key", () => {
  expect(Object.keys(SPRITE_MANIFEST).sort()).toEqual([...SPRITE_KEYS].sort());
});

it.each(SPRITE_KEYS)("has a file for %s that is as big as the manifest says", key => {
  const svg = fileOf(spriteUrl(key));
  const {sizePixels} = SPRITE_MANIFEST[key];

  expect(svg).toContain(`width="${sizePixels}"`);
  expect(svg).toContain(`height="${sizePixels}"`);
  expect(svg).toContain(`viewBox="0 0 ${sizePixels} ${sizePixels}"`);
});

it("draws a standing player's body, 18 pixels in radius, as big as the circle that walls stop", () => {
  const {pixelsPerTile} = SPRITE_MANIFEST["sprite-player-stand-blue"];

  expect(18 / pixelsPerTile).toBeCloseTo(PLAYER_RADIUS);
});

it("anchors a player picture on the centre of the body, which the art draws at (27, 32)", () => {
  expect(SPRITE_MANIFEST["sprite-player-stand-blue"].anchor).toEqual({x: 27, y: 32});
  expect(SPRITE_MANIFEST["sprite-player-crouch-blue"].anchor).toEqual({x: 27, y: 32});
  expect(SPRITE_MANIFEST["sprite-player-stand-orange"].anchor).toEqual({x: 27, y: 32});
  expect(fileOf(spriteUrl("sprite-player-stand-orange"))).toContain('cx="27" cy="32" r="18"');
  expect(fileOf(spriteUrl("sprite-player-stand-blue"))).toContain('cx="27" cy="32" r="18"');
  expect(fileOf(spriteUrl("sprite-player-crouch-blue"))).toContain('cx="27" cy="32" r="13"');
});

it("draws a dummy's body, 17 pixels in radius, as big as the circle a bullet must touch, centred on (32, 32)", () => {
  const {pixelsPerTile, anchor} = SPRITE_MANIFEST["sprite-dummy"];

  expect(17 / pixelsPerTile).toBeCloseTo(DUMMY_RADIUS);
  expect(anchor).toEqual({x: 32, y: 32});
  expect(fileOf(spriteUrl("sprite-dummy"))).toContain('cx="32" cy="32" r="17"');
});

it("draws a crouched player at the same scale as a standing one, so the drawing shrinks and the circle walls stop does not", () => {
  expect(SPRITE_MANIFEST["sprite-player-crouch-blue"].pixelsPerTile).toBe(
    SPRITE_MANIFEST["sprite-player-stand-blue"].pixelsPerTile,
  );
});
