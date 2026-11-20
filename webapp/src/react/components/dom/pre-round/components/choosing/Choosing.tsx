import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";
import {MARKSMAN_RIFLE} from "@gunsmith/engine/weapon/weapons/MarksmanRifle";
import {RIFLE} from "@gunsmith/engine/weapon/weapons/Rifle";
import {weaponChoicesOf} from "@src/react/components/dom/pre-round/components/choosing/choices/WeaponChoicesOf";
import {WeaponPicker} from "@src/react/components/dom/pre-round/components/choosing/components/weapon-picker/WeaponPicker";
import {usePreRoundStore} from "@src/store/pre-round/UsePreRoundStore";
import {useShelfStore} from "@src/store/shelf/UseShelfStore";
import type {JSX} from "react";
import {useState} from "react";

/** The first step: a weapon for each slot, from the built-ins and the shelf. Choosing nothing is the rifle and the marksman rifle, a match as it is without a pre-round. Free and instant: nothing is written or made here. */
export function Choosing(): JSX.Element {
  const saved = useShelfStore(state => state.weapons);
  const [first, setFirst] = useState<Weapon>(RIFLE);
  const [second, setSecond] = useState<Weapon>(MARKSMAN_RIFLE);
  const choices = weaponChoicesOf(saved);

  return (
    <>
      <WeaponPicker slot={1} choices={choices} chosen={first} onChoose={setFirst} />

      <WeaponPicker slot={2} choices={choices} chosen={second} onChoose={setSecond} />

      <button
        type="button"
        className="self-start rounded-md bg-gs-team-blue px-6 py-3 text-lg font-semibold text-gs-background"
        onClick={() => {
          usePreRoundStore.getState().lockIn({first, second});
        }}
      >
        Lock in
      </button>
    </>
  );
}
