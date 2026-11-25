import {SaveAccountItem} from "@src/react/components/dom/workshop/components/save-account-item/SaveAccountItem";
import {useAccountLibraryStore} from "@src/store/account-library/UseAccountLibraryStore";
import {weaponAppearances} from "@src/assets/weapon-drawings/appearances/WeaponAppearances";
import {weaponPictureUrl} from "@src/assets/weapon-pictures/WeaponPictureUrl";
import {SaveWeapon} from "@src/react/components/dom/workshop/components/weapon-card/components/save-weapon/SaveWeapon";
import {StatRow} from "@src/react/components/dom/workshop/components/weapon-card/components/stat-row/StatRow";
import {statRowsOf} from "@src/react/components/dom/weapon-numbers/StatRowsOf";
import {ratingPercentOf} from "@src/react/components/dom/weapon-numbers/RatingPercentOf";
import {tryOnTheRange} from "@src/react/components/dom/workshop/weapon-on-trial/TryOnTheRange";
import {useWorkshopStore} from "@src/store/workshop/UseWorkshopStore";
import type {JSX} from "react";

/**
 * The card for the weapon last made: its name and drawing, its power rating and its stats, in plain words, **Try it**, which puts the weapon in slot 2 and in
 * hand on the practice range and shuts the workshop, and **Save**, which puts it on the shelf. Nothing shows before the first Make.
 */
export function WeaponCard(): JSX.Element | undefined {
  const weapon = useWorkshopStore(state => state.weapon);
  const accountItemId = useWorkshopStore(state => state.accountItemId);
  const session = useAccountLibraryStore(state => state.session);
  if (!weapon) {
    return undefined;
  }

  const name = weapon.identity?.name ?? "Weapon";
  const picture = weaponPictureUrl(weapon.identity?.key, weaponAppearances.get(weapon));
  const rating = ratingPercentOf(weapon);

  return (
    <section
      data-testid="workshop-result"
      aria-label="Result"
      className="flex flex-col gap-3 rounded-md border border-gs-edge/40 bg-gs-background/35 px-4 py-3"
    >
      <div className="flex items-center gap-4">
        {picture && (
          <img
            src={picture}
            alt={`${name}, drawn`}
            width={80}
            height={80}
            className="size-20 shrink-0 rounded-md border border-gs-edge/40 bg-gs-floor-l1 object-contain p-[7px]"
          />
        )}

        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <h2 className="text-xl leading-tight font-semibold wrap-anywhere text-gs-ui-text">{name}</h2>

          <p className="flex flex-wrap items-baseline justify-between gap-x-2">
            <span className="text-xs tracking-wide text-gs-ui-muted uppercase">Power rating</span>

            <span className="font-mono text-sm whitespace-nowrap text-gs-ui-muted tabular-nums">
              <span data-testid="workshop-rating" className="text-lg font-semibold text-gs-ui-text">
                {rating}
              </span>
              {" / 100"}
            </span>
          </p>

          <div
            role="meter"
            aria-label="Power rating"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={rating}
            className="h-1.5 overflow-hidden rounded-full bg-gs-floor-l2"
          >
            <div
              data-testid="workshop-rating-fill"
              className="h-full rounded-full bg-gs-success"
              style={{width: `${rating}%`}}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-start gap-2">
        <button
          type="button"
          className="rounded-md bg-gs-team-blue px-5 py-2 font-semibold text-gs-background"
          onClick={() => {
            tryOnTheRange(weapon);
          }}
        >
          Try it
        </button>

        {session === "guest" && accountItemId === undefined && <SaveWeapon weapon={weapon} />}

        {session === "signed-in" && accountItemId !== undefined && (
          <SaveAccountItem kind="weapon" key={accountItemId} id={accountItemId} />
        )}
      </div>

      <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,14rem),1fr))] gap-x-5">
        {statRowsOf(weapon).map(row => (
          <StatRow key={row.label} label={row.label} value={row.value} />
        ))}
      </ul>
    </section>
  );
}
