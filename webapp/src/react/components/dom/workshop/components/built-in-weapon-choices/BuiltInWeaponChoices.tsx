import {BUILT_IN_WEAPONS} from "@gunsmith/engine/built-in-weapons/BuiltInWeapons";
import {useAccountLibraryStore} from "@src/store/account-library/UseAccountLibraryStore";
import {useWorkshopStore} from "@src/store/workshop/UseWorkshopStore";
import type {JSX} from "react";

export function BuiltInWeaponChoices(): JSX.Element | undefined {
  const session = useAccountLibraryStore(state => state.session);
  const making = useWorkshopStore(state => state.making);
  const selected = useWorkshopStore(state => state.weapon);
  if (session !== "signed-in") return undefined;

  return (
    <div role="group" aria-label="Built-in weapons" className="flex flex-wrap gap-2">
      {BUILT_IN_WEAPONS.map(weapon => (
        <button
          key={weapon.identity?.key}
          type="button"
          disabled={making}
          aria-pressed={selected === weapon}
          className="rounded-sm border border-gs-edge/40 px-3 py-1 text-sm aria-pressed:border-gs-team-blue"
          onClick={() => {
            useWorkshopStore.getState().setWeapon(weapon);
          }}
        >
          {weapon.identity?.name}
        </button>
      ))}
    </div>
  );
}
