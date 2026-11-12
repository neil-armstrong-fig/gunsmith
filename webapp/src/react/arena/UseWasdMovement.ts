import {directionFromKeys} from "@src/react/arena/movement/DirectionFromKeys";
import type {Direction} from "@src/react/arena/types/Direction";
import {useEffect, useRef} from "react";
import type {RefObject} from "react";

/**
 * The heading the WASD keys currently ask for. A ref, not state: the arena reads it every frame inside `useFrame`,
 * and per-frame values stay out of React and Redux.
 */
export function useWasdMovement(): RefObject<Direction> {
  const directionRef = useRef<Direction>({x: 0, y: 0});

  useEffect(() => {
    const heldKeys = new Set<string>();

    window.addEventListener("keydown", press);
    window.addEventListener("keyup", release);
    window.addEventListener("blur", releaseAll);

    return () => {
      window.removeEventListener("keydown", press);
      window.removeEventListener("keyup", release);
      window.removeEventListener("blur", releaseAll);
    };

    function press(event: KeyboardEvent): void {
      heldKeys.add(event.code);
      directionRef.current = directionFromKeys(heldKeys);
    }

    function release(event: KeyboardEvent): void {
      heldKeys.delete(event.code);
      directionRef.current = directionFromKeys(heldKeys);
    }

    // A key released while the window is not focused never fires `keyup`, so losing focus lets go of everything.
    function releaseAll(): void {
      heldKeys.clear();
      directionRef.current = directionFromKeys(heldKeys);
    }
  }, []);

  return directionRef;
}
