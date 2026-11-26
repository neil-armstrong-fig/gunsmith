import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";
import {RevealedWeapon} from "@src/react/components/dom/pre-round/components/revealed-weapon/RevealedWeapon";
import type {JSX} from "react";

interface Props {
  slot: 1 | 2;
  weapon: Weapon;
  /** Whether the player may fold it back to its picture and name: once both their weapons are locked in. */
  foldable: boolean;
  onFold: () => void;
}

/** The other player's weapon as the reveal shows it (drawing, power rating and stats), with **Hide stats** when it can be folded again. */
export function OpponentWeaponCard({slot, weapon, foldable, onFold}: Props): JSX.Element {
  return (
    <div className="flex flex-col gap-1">
      <p>Theirs:</p>

      <div
        data-testid={`room-opponent-weapon-${slot}`}
        className="flex max-w-sm flex-col gap-2 rounded-md border border-gs-edge/40 bg-gs-background/35 px-3 py-2"
      >
        <RevealedWeapon weapon={weapon} />

        {foldable && (
          <button
            type="button"
            aria-expanded={true}
            className="self-start text-xs text-gs-ui-muted underline hover:text-gs-ui-text"
            onClick={onFold}
          >
            Hide stats
          </button>
        )}
      </div>
    </div>
  );
}
