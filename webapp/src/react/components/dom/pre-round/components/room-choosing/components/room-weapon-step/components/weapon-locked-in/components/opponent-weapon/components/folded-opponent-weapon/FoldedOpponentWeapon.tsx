import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";
import {WeaponPicture} from "@src/react/components/dom/pre-round/components/weapon-picture/WeaponPicture";
import type {JSX} from "react";

interface Props {
  slot: 1 | 2;
  weapon: Weapon;
  onOpen: () => void;
}

/** The other player's weapon folded to its picture and name on one line, which opens to show its stats when pressed. */
export function FoldedOpponentWeapon({slot, weapon, onOpen}: Props): JSX.Element {
  return (
    <div className="flex items-center gap-2">
      <span>Theirs:</span>

      <div data-testid={`room-opponent-weapon-${slot}`}>
        <button
          type="button"
          aria-expanded={false}
          className="flex items-center gap-2 rounded-md border border-gs-edge/40 bg-gs-background/35 px-3 py-1 text-left hover:border-gs-edge"
          onClick={onOpen}
        >
          <WeaponPicture weapon={weapon} />

          <span data-testid="reveal-weapon-name" className="font-semibold">
            {weapon.identity?.name ?? "Weapon"}
          </span>

          <span className="text-xs text-gs-ui-muted">Show stats</span>
        </button>
      </div>
    </div>
  );
}
