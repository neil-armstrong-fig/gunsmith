import {ReplacementChoice} from "@src/react/components/dom/workshop/components/weapon-card/components/save-weapon/components/weapon-replacement-picker/components/replacement-choice/ReplacementChoice";
import type {ShelfWeapon} from "@src/store/shelf/types/ShelfWeapon";
import type {JSX} from "react";

interface Props {
  weapons: readonly ShelfWeapon[];
  onReplace: (id: string) => void;
  onCancel: () => void;
}

export function WeaponReplacementPicker({weapons, onReplace, onCancel}: Props): JSX.Element {
  return (
    <div
      role="group"
      aria-label="Replace which weapon?"
      className="flex w-full flex-col gap-2 rounded-md border border-gs-edge/40 px-3 py-2"
    >
      <p className="text-sm text-gs-ui-muted">The shelf is full. Replace which weapon?</p>

      <ul className="flex flex-col gap-2">
        {weapons.map(item => (
          <ReplacementChoice key={item.id} saved={item} onReplace={onReplace} />
        ))}
      </ul>

      <button type="button" className="self-start rounded-sm px-2 py-0.5 text-sm text-gs-ui-muted" onClick={onCancel}>
        Cancel
      </button>
    </div>
  );
}
