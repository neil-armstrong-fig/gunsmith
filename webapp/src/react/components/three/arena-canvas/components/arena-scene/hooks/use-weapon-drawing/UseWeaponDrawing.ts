import {useEffect, useSyncExternalStore} from "react";
import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";
import {MARKSMAN_RIFLE} from "@gunsmith/engine/weapon/weapons/MarksmanRifle";
import {RIFLE} from "@gunsmith/engine/weapon/weapons/Rifle";
import {SUBMACHINE_GUN} from "@gunsmith/engine/weapon/weapons/SubmachineGun";
import {APPEARANCE_LIMITS} from "@gunsmith/shared/appearance/schema/AppearanceLimits";
import {SPRITE_MANIFEST} from "@src/assets/sprites/SpriteManifest";
import type {SpriteEntry} from "@src/assets/sprites/types/SpriteEntry";
import type {SpriteKey} from "@src/assets/sprites/types/SpriteKey";
import {weaponDrawingOfPage} from "@src/game/scenario/weapon-drawing/WeaponDrawingOfPage";
import {loadedWeaponDrawing} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-weapon-drawing/texture/LoadedWeaponDrawing";
import {loadWeaponDrawing} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-weapon-drawing/texture/load-weapon-drawing/LoadWeaponDrawing";
import type {WeaponDrawing} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-weapon-drawing/types/WeaponDrawing";
import {loadedSprite} from "@src/react/components/three/arena-canvas/sprites/loaded/LoadedSprite";
import {spritesReadiness} from "@src/react/components/three/arena-canvas/sprites/SpritesReadiness";

const AUTHORED_SPRITES = new Map<Weapon, SpriteKey>([
  [RIFLE, "sprite-rifle-default"],
  [MARKSMAN_RIFLE, "sprite-marksman-rifle"],
  [SUBMACHINE_GUN, "sprite-submachine-gun"],
]);

// Generated v1 drawings face right. Use a fixed grip at the rear of that canvas for the preview.
const GENERATED_SPRITE: SpriteEntry = {
  sizePixels: APPEARANCE_LIMITS.space,
  anchor: {x: 4, y: APPEARANCE_LIMITS.space / 2},
  pixelsPerTile: SPRITE_MANIFEST["sprite-rifle-default"].pixelsPerTile,
};

/** Resolve one drawing per weapon, independent of where it will be placed. */
export function useWeaponDrawing(weapon: Weapon | undefined): WeaponDrawing | undefined {
  const appearance = previewAppearanceOf(weapon);
  const spriteKey = weapon && AUTHORED_SPRITES.get(weapon);

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

/** The existing scenario gives the built-in pickup a fixture appearance, which follows it into the loadout. */
function previewAppearanceOf(weapon: Weapon | undefined): unknown {
  if (weapon === SUBMACHINE_GUN) {
    return weaponDrawingOfPage();
  }

  return undefined;
}
