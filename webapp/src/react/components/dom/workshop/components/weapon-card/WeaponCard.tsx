import {powerRatingOf} from "@gunsmith/engine/power-rating/PowerRatingOf";
import {weaponPictureUrl} from "@src/assets/weapon-pictures/WeaponPictureUrl";
import {StatRow} from "@src/react/components/dom/workshop/components/weapon-card/components/stat-row/StatRow";
import {statRowsOf} from "@src/react/components/dom/workshop/components/weapon-card/stat-rows/StatRowsOf";
import {useWorkshopStore} from "@src/store/workshop/UseWorkshopStore";
import type {JSX} from "react";

/** The card for the weapon last made: its name and drawing, its power rating and its stats, in plain words. Nothing shows before the first Make. */
export function WeaponCard(): JSX.Element | undefined {
  const weapon = useWorkshopStore(state => state.weapon);
  if (!weapon) {
    return undefined;
  }

  const name = weapon.identity?.name ?? "Weapon";
  const picture = weaponPictureUrl(weapon.identity?.key);

  return (
    <section
      data-testid="workshop-result"
      aria-label="Result"
      className="flex flex-col gap-3 rounded-md border border-gs-edge/40 px-4 py-3"
    >
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-gs-ui-text">{name}</h2>

        <p className="flex items-baseline gap-2">
          <span className="text-xs tracking-wide text-gs-ui-muted uppercase">Power rating</span>

          <span data-testid="workshop-rating" className="font-mono text-2xl text-gs-ui-text tabular-nums">
            {Math.round(powerRatingOf(weapon) * 100)}
          </span>
        </p>
      </div>

      {picture && <img src={picture} alt={`${name}, drawn`} className="h-16 self-start" />}

      <ul className="flex flex-col gap-1">
        {statRowsOf(weapon).map(row => (
          <StatRow key={row.label} label={row.label} value={row.value} />
        ))}
      </ul>
    </section>
  );
}
