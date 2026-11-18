import {useEffect, useSyncExternalStore} from "react";
import {APPEARANCE_LIMITS} from "@gunsmith/shared/appearance/schema/AppearanceLimits";
import {SPRITE_MANIFEST} from "@src/assets/sprites/SpriteManifest";
import type {SpriteEntry} from "@src/assets/sprites/types/SpriteEntry";
import type {SpriteKey} from "@src/assets/sprites/types/SpriteKey";
import {weaponDrawingOfPage} from "@src/game/scenario/weapon-drawing/WeaponDrawingOfPage";
import {roomOfPage} from "@src/online/RoomOfPage";
import {loadedWeaponDrawing} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-weapon-drawing/texture/LoadedWeaponDrawing";
import {loadWeaponDrawing} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-weapon-drawing/texture/load-weapon-drawing/LoadWeaponDrawing";
import type {WeaponDrawing} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-weapon-drawing/types/WeaponDrawing";
import {loadedSprite} from "@src/react/components/three/arena-canvas/sprites/loaded/LoadedSprite";
import {spritesReadiness} from "@src/react/components/three/arena-canvas/sprites/SpritesReadiness";

const SUBMACHINE_GUN_KEY = "submachine-gun";

const AUTHORED_SPRITES = new Map<string, SpriteKey>([
  ["rifle", "sprite-rifle-default"],
  ["marksman-rifle", "sprite-marksman-rifle"],
  [SUBMACHINE_GUN_KEY, "sprite-submachine-gun"],
]);

// Generated v1 drawings face right. Use a fixed grip at the rear of that canvas for the preview.
const GENERATED_SPRITE: SpriteEntry = {
  sizePixels: APPEARANCE_LIMITS.space,
  anchor: {x: 4, y: APPEARANCE_LIMITS.space / 2},
  pixelsPerTile: SPRITE_MANIFEST["sprite-rifle-default"].pixelsPerTile,
};

/** Resolve one drawing per weapon, independent of where it will be placed. */
export function useWeaponDrawing(weaponKey: string | undefined): WeaponDrawing | undefined {
  const appearance = previewAppearanceOf(weaponKey);
  const spriteKey = weaponKey && AUTHORED_SPRITES.get(weaponKey);

  useEffect(() => {
    if (appearance !== undefined) {
      loadWeaponDrawing(appearance);
    }
  }, [appearance]);

  const texture = useSyncExternalStore(spritesReadiness.subscribe, () => {
    if (appearance !== undefined) {
      return loadedWeaponDrawing(appearance);
    }

    if (spriteKey) {
      return loadedSprite(spriteKey);
    }

    return undefined;
  });
  if (!texture) {
    return undefined;
  }

  if (appearance !== undefined || !spriteKey) {
    return {texture, sprite: GENERATED_SPRITE};
  }

  return {texture, sprite: SPRITE_MANIFEST[spriteKey]};
}

/** The local preview gives its built-in pickup a fixture appearance that follows it into the loadout. */
function previewAppearanceOf(weaponKey: string | undefined): unknown {
  if (weaponKey === SUBMACHINE_GUN_KEY && roomOfPage() === undefined) {
    return weaponDrawingOfPage();
  }

  return undefined;
}
