import {useEffect, useSyncExternalStore} from "react";
import type {CanvasTexture} from "three";
import {weaponDrawingOfPage} from "@src/game/scenario/weapon-drawing/WeaponDrawingOfPage";
import {spritesReadiness} from "@src/react/components/three/arena-canvas/sprites/SpritesReadiness";
import {loadedWeaponDrawing} from "@src/react/components/three/arena-canvas/components/arena-scene/components/pickup/hooks/use-weapon-drawing/texture/LoadedWeaponDrawing";
import {loadWeaponDrawing} from "@src/react/components/three/arena-canvas/components/arena-scene/components/pickup/hooks/use-weapon-drawing/texture/load-weapon-drawing/LoadWeaponDrawing";

/**
 * The texture of the drawing the page was opened with (`?weaponDrawing=`), once it has been made, and `undefined` when the page names none or until then: draw the
 * placeholder. Nothing links a real weapon to a drawing yet, so this is the only way one reaches the arena.
 */
export function useWeaponDrawing(): CanvasTexture | undefined {
  const appearance = weaponDrawingOfPage();

  useEffect(() => {
    if (appearance !== undefined) {
      loadWeaponDrawing(appearance);
    }
  }, [appearance]);

  return useSyncExternalStore(spritesReadiness.subscribe, () => loadedWeaponDrawing(appearance));
}
