import {useFrame} from "@react-three/fiber";
import {nextFlash} from "@src/react/components/three/arena-canvas/components/arena-scene/flash/NextFlash";
import type {Flash} from "@src/react/components/three/arena-canvas/components/arena-scene/flash/types/Flash";
import {cameraPositionOf} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-camera-shake/camera-position/CameraPositionOf";
import {shakeOfCamera} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-camera-shake/camera-position/ShakeOfCamera";
import {shakeOffset} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-camera-shake/shake-offset/ShakeOffset";
import {useAppStore} from "@src/store/app/UseAppStore";
import {useFeedbackStore} from "@src/store/feedback/UseFeedbackStore";
import {gameState} from "@src/store/game/selectors/game-state/GameState";
import {useRef} from "react";

/** What the acceptance specs read: where the camera has moved the picture, in screen pixels, as `x,y`, off the camera as it was applied. */
const SHAKE_ATTRIBUTE = "data-camera-shake";

/**
 * Shakes the camera for 100 ms when a bullet hurts the player (art's curve, 12 pixels by default; `?shake=<pixels>` tunes it and `0` is off). The ring never does:
 * only `bulletHits` starts it, through the same `nextFlash` that the brackets use, so a burst is one shake. Reduced motion is no shake. It moves the camera and nothing
 * else: where the player aims is worked out on the camera as it stands still (`arenaPointAtPixel`), so a hit never nudges the aim, and the reticle and the HUD are
 * not part of the picture. Runs after the camera has been fitted to the window, so the last word on where the camera is, this frame, is the shake's.
 */
export function useCameraShake(): void {
  const flashRef = useRef<Flash>({hitsSeen: 0, age: Number.POSITIVE_INFINITY});
  const writtenRef = useRef("");

  useFrame(({camera, gl}, seconds) => {
    flashRef.current = nextFlash({flash: flashRef.current, hits: useFeedbackStore.getState().bulletHits, seconds});
    if (!(camera.zoom > 0)) {
      return;
    }

    const {arena} = gameState();
    const centre = {x: arena.width / 2, y: arena.height / 2};
    const {reducedMotion, shakePixels} = useAppStore.getState();

    const shake = shakeOffset({age: flashRef.current.age, pixels: pixelsToShake(reducedMotion, shakePixels)});
    const position = cameraPositionOf({centre, shake, zoom: camera.zoom});
    camera.position.x = position.x;
    camera.position.y = position.y;

    const applied = shakeOfCamera({centre, position: camera.position, zoom: camera.zoom});
    const written = `${Number(applied.x.toFixed(3))},${Number(applied.y.toFixed(3))}`;
    if (written !== writtenRef.current) {
      writtenRef.current = written;
      gl.domElement.setAttribute(SHAKE_ATTRIBUTE, written);
    }
  });
}

function pixelsToShake(reducedMotion: boolean, shakePixels: number): number {
  if (reducedMotion) {
    return 0;
  }

  return shakePixels;
}
