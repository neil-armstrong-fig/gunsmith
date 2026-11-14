import {pullsTheTrigger} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/hooks/use-firing/trigger/PullsTheTrigger";
import type {ClickTarget} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/hooks/use-firing/trigger/types/ClickTarget";
import {FiringLatch} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/hooks/use-firing/trigger/FiringLatch";
import {useEffect, useState} from "react";

/**
 * The trigger: pulled by the left mouse button (not on a button of the overlay), and let go of when it is released or
 * the window loses focus.
 */
export function useFiring(): FiringLatch {
  const [latch] = useState(() => new FiringLatch());

  useEffect(() => {
    window.addEventListener("mousedown", press);
    window.addEventListener("mouseup", release);
    window.addEventListener("blur", releaseAll);

    return () => {
      window.removeEventListener("mousedown", press);
      window.removeEventListener("mouseup", release);
      window.removeEventListener("blur", releaseAll);
    };

    function press(event: MouseEvent): void {
      if (pullsTheTrigger({button: event.button, target: targetOf(event)})) {
        latch.press();
      }
    }

    function targetOf(event: MouseEvent): ClickTarget | undefined {
      if (event.target instanceof Element) {
        return event.target;
      }

      return undefined;
    }

    function release(event: MouseEvent): void {
      if (event.button === 0) {
        latch.release();
      }
    }

    // A button released while the window is not focused never fires `mouseup`, so losing focus lets go of it.
    function releaseAll(): void {
      latch.release();
    }
  }, [latch]);

  return latch;
}
