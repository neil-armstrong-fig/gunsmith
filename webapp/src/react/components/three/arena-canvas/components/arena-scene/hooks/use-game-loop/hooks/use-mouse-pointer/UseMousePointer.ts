import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {useEffect, useRef} from "react";
import type {RefObject} from "react";

/**
 * Where the mouse is in the window, in pixels from its top-left corner, or `undefined` until it has moved: before that
 * there is nothing to aim at. A ref, because it is read every frame and per-frame values stay out of React.
 */
export function useMousePointer(): RefObject<Point | undefined> {
  const pixelRef = useRef<Point | undefined>(undefined);

  useEffect(() => {
    window.addEventListener("mousemove", move);

    return () => {
      window.removeEventListener("mousemove", move);
    };

    function move(event: MouseEvent): void {
      pixelRef.current = {x: event.clientX, y: event.clientY};
    }
  }, []);

  return pixelRef;
}
