import {WeaponKeyLatch} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/hooks/use-weapon-keys/latch/WeaponKeyLatch";
import {usePressedKey} from "@src/react/hooks/use-pressed-key/UsePressedKey";
import {useState} from "react";

/** R reloads, and the number keys switch weapon: 1 is the first slot. A held key's repeats are not presses; the engine would ignore them anyway. */
export function useWeaponKeys(): WeaponKeyLatch {
  const [latch] = useState(() => new WeaponKeyLatch());

  usePressedKey("KeyR", () => {
    latch.pressReload();
  });
  usePressedKey("Digit1", () => {
    latch.pressSlot(1);
  });
  usePressedKey("Digit2", () => {
    latch.pressSlot(2);
  });

  return latch;
}
