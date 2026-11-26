import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";
import {WeaponPicture} from "@src/react/components/dom/pre-round/components/weapon-picture/WeaponPicture";
import {ratingPercentOf} from "@src/react/components/dom/weapon-numbers/RatingPercentOf";
import {statRowsOf} from "@src/react/components/dom/weapon-numbers/StatRowsOf";
import type {JSX} from "react";

interface Props {
  weapon: Weapon;
}

/** One weapon as a card (on the reveal, and the other player's weapon while choosing): its drawing and name, its power rating out of 100 with a meter, and its six stats, so a player can weigh all four before the match. */
export function RevealedWeapon({weapon}: Props): JSX.Element {
  const rating = ratingPercentOf(weapon);

  return (
    <div className="flex flex-col gap-1.5">
      <p className="flex items-center gap-2 font-semibold text-gs-ui-text">
        <WeaponPicture weapon={weapon} />

        <span data-testid="reveal-weapon-name" className="min-w-0 wrap-anywhere">
          {weapon.identity?.name ?? "Weapon"}
        </span>
      </p>

      <p className="flex items-center gap-2 text-xs text-gs-ui-muted">
        <span className="tracking-wide uppercase">Power</span>

        <span
          role="meter"
          aria-label="Power rating"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={rating}
          className="h-1.5 flex-1 overflow-hidden rounded-full bg-gs-floor-l2"
        >
          <span className="block h-full rounded-full bg-gs-success" style={{width: `${rating}%`}} />
        </span>

        <span
          data-testid="reveal-weapon-rating"
          className="font-mono text-sm font-semibold text-gs-ui-text tabular-nums"
        >
          {rating}
        </span>
      </p>

      <ul className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        {statRowsOf(weapon).map(row => (
          <li key={row.label} data-testid="reveal-stat" className="flex flex-col">
            <span data-testid="reveal-stat-label" className="text-gs-ui-muted">
              {row.label}
            </span>

            <span data-testid="reveal-stat-value" className="font-mono text-gs-ui-text tabular-nums">
              {row.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
