import {WeaponPicture} from "@src/react/components/dom/pre-round/components/weapon-picture/WeaponPicture";
import type {SlotWeapon} from "@src/react/components/dom/pre-round/components/side/types/SlotWeapon";
import type {JSX} from "react";

interface Props {
  testId: string;
  title: string;
  weapons: readonly SlotWeapon[];
}

/** One fighter's weapons in the reveal, under a title, one row for each slot. */
export function Side({testId, title, weapons}: Props): JSX.Element {
  return (
    <section data-testid={testId} className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold text-gs-ui-text">{title}</h2>

      <ul className="flex flex-col gap-2">
        {weapons.map(({slot, weapon}) => (
          <li key={slot} data-testid="reveal-weapon" className="flex items-center gap-2 text-gs-ui-text">
            <WeaponPicture weapon={weapon} />

            {weapon.identity?.name ?? "Weapon"}
          </li>
        ))}
      </ul>
    </section>
  );
}
