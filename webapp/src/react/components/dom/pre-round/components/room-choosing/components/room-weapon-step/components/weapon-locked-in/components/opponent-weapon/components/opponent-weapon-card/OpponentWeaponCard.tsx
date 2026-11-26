import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";
import {RevealedWeapon} from "@src/react/components/dom/pre-round/components/revealed-weapon/RevealedWeapon";
import type {JSX} from "react";

interface Props {
  slot: 1 | 2;
  weapon: Weapon;
}

/** The other player's weapon as the reveal shows it (drawing, power rating and stats), while the player still chooses their second. */
export function OpponentWeaponCard({slot, weapon}: Props): JSX.Element {
  return (
    <div className="flex flex-col gap-1">
      <p>Theirs:</p>

      <div
        data-testid={`room-opponent-weapon-${slot}`}
        className="max-w-sm rounded-md border border-gs-edge/40 bg-gs-background/35 px-3 py-2"
      >
        <RevealedWeapon weapon={weapon} />
      </div>
    </div>
  );
}
