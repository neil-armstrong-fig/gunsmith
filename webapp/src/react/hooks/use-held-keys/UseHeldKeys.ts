import {useEffect, useRef} from "react";
import type {RefObject} from "react";

/**
 * Whatever `fromKeys` makes of the keys held right now (as `KeyboardEvent.code`s), kept up to date as keys go down and up.
 * A ref, not state: the arena reads it every frame inside `useFrame`, and per-frame values stay out of React state.
 * `fromKeys` must be a module-level function, not one made in a render, or the listeners are set up again every render.
 */
export function useHeldKeys<Held>(fromKeys: (heldKeys: ReadonlySet<string>) => Held): RefObject<Held> {
  const heldRef = useRef<Held>(fromKeys(new Set()));

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
      heldRef.current = fromKeys(heldKeys);
    }

    function release(event: KeyboardEvent): void {
      heldKeys.delete(event.code);
      heldRef.current = fromKeys(heldKeys);
    }

    // A key released while the window is not focused never fires `keyup`, so losing focus lets go of everything.
    function releaseAll(): void {
      heldKeys.clear();
      heldRef.current = fromKeys(heldKeys);
    }
  }, [fromKeys]);

  return heldRef;
}
