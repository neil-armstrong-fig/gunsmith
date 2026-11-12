import {useFrame} from "@react-three/fiber";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import {step} from "@gunsmith/engine/game-loop/Step";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import {STATE_HOOK_NAME} from "@gunsmith/shared/state-hook/StateHookName";
import {arenaPointAtPixel} from "@src/react/arena-canvas/components/arena-scene/hooks/use-game-loop/pointer/ArenaPointAtPixel";
import {fixedTicks} from "@src/react/arena-canvas/components/arena-scene/hooks/use-game-loop/clock/FixedTicks";
import {TICK_SECONDS} from "@src/react/arena-canvas/components/arena-scene/hooks/use-game-loop/clock/TickSeconds";
import {snapshotOf} from "@src/react/arena-canvas/components/arena-scene/hooks/use-game-loop/state-hook/SnapshotOf";
import {useFiring} from "@src/react/arena-canvas/components/arena-scene/hooks/use-game-loop/hooks/use-firing/UseFiring";
import {useMousePointer} from "@src/react/arena-canvas/components/arena-scene/hooks/use-game-loop/hooks/use-mouse-pointer/UseMousePointer";
import {useWasdMovement} from "@src/react/arena-canvas/components/arena-scene/hooks/use-game-loop/hooks/use-wasd-movement/UseWasdMovement";
import {useEffect, useRef} from "react";
import type {RefObject} from "react";

/**
 * Runs the match: every frame it plays however many fixed steps the time since the last one owes, with the keys, mouse
 * and trigger as they are right now as the player's input. The world lives in a ref, not state: it changes every frame,
 * and per-frame values stay out of React and Redux. It also puts the acceptance specs' read-only state hook on the page.
 */
export function useGameLoop(arena: Arena): RefObject<World> {
  const worldRef = useRef<World>(startingWorld(arena));
  const leftoverSecondsRef = useRef(0);
  const directionRef = useWasdMovement();
  const pointerRef = useMousePointer();
  const trigger = useFiring();

  useEffect(() => {
    Reflect.set(window, STATE_HOOK_NAME, () => snapshotOf(worldRef.current));

    return () => {
      Reflect.deleteProperty(window, STATE_HOOK_NAME);
    };
  }, []);

  useFrame(({size}, frameSeconds) => {
    const owed = fixedTicks(leftoverSecondsRef.current, frameSeconds);
    leftoverSecondsRef.current = owed.leftoverSeconds;

    const pixel = pointerRef.current;
    const aimAt = pixel && arenaPointAtPixel(pixel, arena, size);

    for (let tick = 0; tick < owed.ticks; tick += 1) {
      const input = {direction: directionRef.current, aimAt, firing: trigger.isFiring()};

      worldRef.current = step(worldRef.current, input, TICK_SECONDS);
    }

    trigger.afterTicks(owed.ticks);
  });

  return worldRef;
}
