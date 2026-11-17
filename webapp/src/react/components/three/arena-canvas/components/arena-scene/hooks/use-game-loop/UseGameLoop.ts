import {useFrame} from "@react-three/fiber";
import {engine} from "@gunsmith/engine/Engine";
import {STATE_HOOK_NAME} from "@gunsmith/shared/state-hook/StateHookName";
import {gameState} from "@src/store/game/selectors/game-state/GameState";
import {useGameStore} from "@src/store/game/UseGameStore";
import {arenaPointAtPixel} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/pointer/ArenaPointAtPixel";
import {fixedTicks} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/clock/FixedTicks";
import {TICK_SECONDS} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/clock/TickSeconds";
import {snapshotOf} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/state-hook/SnapshotOf";
import {useCrouchKey} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/hooks/use-crouch-key/UseCrouchKey";
import {useCombatSounds} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/hooks/use-combat-sounds/UseCombatSounds";
import {useFiring} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/hooks/use-firing/UseFiring";
import {useMousePointer} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/hooks/use-mouse-pointer/UseMousePointer";
import {useWeaponKeys} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/hooks/use-weapon-keys/UseWeaponKeys";
import {useWasdMovement} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/hooks/use-wasd-movement/UseWasdMovement";
import {useEffect, useRef} from "react";

/**
 * Runs the match held in the game store: every frame it plays however many fixed steps the time since the last one
 * owes, with the keys (walking and crouching), mouse and trigger as they are right now as the player's input (a reload or a weapon switch goes to
 * the first step of the frame, once), and puts the resulting world back in the store once, not once per step. It reads the
 * world with `gameState` and renders nothing itself: a per-frame value never goes through React state. It also puts the
 * acceptance specs' read-only state hook on the page. After every step, not once a frame, it tells the sounds what the step
 * reported (`World.events`), since a frame can run several steps and the store keeps only the last world.
 */
export function useGameLoop(): void {
  const leftoverSecondsRef = useRef(0);
  const directionRef = useWasdMovement();
  const crouchingRef = useCrouchKey();
  const pointerRef = useMousePointer();
  const trigger = useFiring();
  const weaponKeys = useWeaponKeys();
  const sounds = useCombatSounds();

  useEffect(() => {
    Reflect.set(window, STATE_HOOK_NAME, () => snapshotOf(gameState()));

    return () => {
      Reflect.deleteProperty(window, STATE_HOOK_NAME);
    };
  }, []);

  useFrame(({size}, frameSeconds) => {
    const owed = fixedTicks(leftoverSecondsRef.current, frameSeconds);
    leftoverSecondsRef.current = owed.leftoverSeconds;

    const startOfFrame = gameState();
    const pixel = pointerRef.current;
    const aimAt = pixel && arenaPointAtPixel(pixel, startOfFrame.arena, size);

    let world = startOfFrame;
    for (let tick = 0; tick < owed.ticks; tick += 1) {
      const input = {
        direction: directionRef.current,
        crouching: crouchingRef.current,
        aimAt,
        firing: trigger.isFiring(),
        reload: weaponKeys.takeReload(),
        switchTo: weaponKeys.takeSlot(),
      };

      world = engine.step(world, input, TICK_SECONDS);
      sounds.afterTick({events: world.events, firing: input.firing, round: world.round});
    }

    if (owed.ticks > 0) {
      useGameStore.getState().setWorld(world);
    }

    trigger.afterTicks(owed.ticks);
  });
}
