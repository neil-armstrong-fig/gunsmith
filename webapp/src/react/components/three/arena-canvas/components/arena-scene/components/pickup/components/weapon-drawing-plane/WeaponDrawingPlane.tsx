import {APPEARANCE_LIMITS} from "@gunsmith/shared/appearance/schema/AppearanceLimits";
import {SPRITE_MANIFEST} from "@src/assets/sprites/SpriteManifest";
import type {JSX} from "react";
import type {CanvasTexture} from "three";

/** `art`: a pickup is the weapon's body at scale 1 or 0.5 (`docs/art/concepts/top-down-oddities/README.md`). Half is 0.71 tile across at the fighters' scale, near the old disc. */
const PICKUP_DRAWING_SCALE = 0.5;

/** The design space's side in tiles at that scale: art's design pixels, at the same pixels per tile as a fighter. */
const PICKUP_DRAWING_TILES =
  (APPEARANCE_LIMITS.space * PICKUP_DRAWING_SCALE) / SPRITE_MANIFEST["sprite-player-stand-blue"].pixelsPerTile;

interface Props {
  texture: CanvasTexture;
}

/** A weapon's drawing lying flat, its design space centred on the pickup. Its colours reach the screen as drawn: no tone mapping, which the palette's colours would not survive. */
export function WeaponDrawingPlane({texture}: Props): JSX.Element {
  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[PICKUP_DRAWING_TILES, PICKUP_DRAWING_TILES]} />

      <meshBasicMaterial map={texture} transparent toneMapped={false} />
    </mesh>
  );
}
