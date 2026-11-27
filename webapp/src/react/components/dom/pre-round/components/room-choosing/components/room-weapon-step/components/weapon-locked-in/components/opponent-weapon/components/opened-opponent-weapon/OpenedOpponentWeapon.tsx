import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";
import {RevealedWeapon} from "@src/react/components/dom/pre-round/components/revealed-weapon/RevealedWeapon";
import type {JSX, KeyboardEvent} from "react";

interface Props {
  slot: 1 | 2;
  weapon: Weapon;
  onFold: () => void;
}

/**
 * The other player's weapon opened to its card after the player locked in both weapons: a press anywhere on the card, or Enter or Space on it,
 * folds it to its picture and name again (the user, 2026-11-26). The card holds a list and paragraphs, which a `<button>` may not, so it is a
 * button by role.
 */
export function OpenedOpponentWeapon({slot, weapon, onFold}: Props): JSX.Element {
  return (
    <div className="flex flex-col gap-1">
      <p>Theirs:</p>

      <div data-testid={`room-opponent-weapon-${slot}`} className="max-w-sm">
        <div
          role="button"
          tabIndex={0}
          aria-expanded={true}
          className="flex cursor-pointer flex-col gap-2 rounded-md border border-gs-edge/40 bg-gs-background/35 px-3 py-2 hover:border-gs-edge focus-visible:outline-2 focus-visible:outline-gs-team-blue"
          onClick={onFold}
          onKeyDown={(event: KeyboardEvent) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onFold();
            }
          }}
        >
          <RevealedWeapon weapon={weapon} />

          <span className="text-xs text-gs-ui-muted">Hide stats</span>
        </div>
      </div>
    </div>
  );
}
