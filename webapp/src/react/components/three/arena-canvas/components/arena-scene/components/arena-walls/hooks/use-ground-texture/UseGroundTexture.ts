import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import {useSprite} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-sprite/UseSprite";
import {useEffect, useMemo} from "react";
import type {CanvasTexture} from "three";
import {RepeatWrapping} from "three";

/** The floor plane covers the arena. Its texture repeats once per tile, starting at the arena origin. */
export function useGroundTexture({width, height}: Arena): CanvasTexture | undefined {
  const tile = useSprite("tile-floor-l1");
  const groundTexture = useMemo(() => {
    if (!tile) {
      return undefined;
    }

    const texture = tile.clone();
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.repeat.set(width, height);
    return texture;
  }, [tile, width, height]);

  useEffect(() => {
    return () => groundTexture?.dispose();
  }, [groundTexture]);

  return groundTexture;
}
