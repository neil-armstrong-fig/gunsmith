import {WeaponKeyLatch} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/hooks/use-weapon-keys/latch/WeaponKeyLatch";
import {useEffect, useState} from "react";

/** The weapon each number key asks for: 1 is the first slot. */
const SLOT_FOR_KEY: Readonly<Record<string, number>> = {Digit1: 1, Digit2: 2};

/** R reloads, and the number keys switch weapon. A held key's repeats do no harm: the engine ignores a reload or switch that changes nothing. */
export function useWeaponKeys(): WeaponKeyLatch {
  const [latch] = useState(() => new WeaponKeyLatch());

  useEffect(() => {
    window.addEventListener("keydown", press);

    return () => {
      window.removeEventListener("keydown", press);
    };

    function press(event: KeyboardEvent): void {
      if (event.code === "KeyR") {
        latch.pressReload();
      }

      const slot = SLOT_FOR_KEY[event.code];
      if (slot !== undefined) {
        latch.pressSlot(slot);
      }
    }
  }, [latch]);

  return latch;
}
