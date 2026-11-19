import {powerRatingOf} from "@gunsmith/engine/power-rating/PowerRatingOf";
import {weaponPictureUrl} from "@src/assets/weapon-pictures/WeaponPictureUrl";
import {worldWithWeaponOnTrial} from "@src/react/components/dom/workshop/components/weapon-card/weapon-on-trial/WorldWithWeaponOnTrial";
import {StatRow} from "@src/react/components/dom/workshop/components/weapon-card/components/stat-row/StatRow";
import {statRowsOf} from "@src/react/components/dom/workshop/components/weapon-card/stat-rows/StatRowsOf";
import {useAppStore} from "@src/store/app/UseAppStore";
import {gameState} from "@src/store/game/selectors/game-state/GameState";
import {useGameStore} from "@src/store/game/UseGameStore";
import {useWorkshopStore} from "@src/store/workshop/UseWorkshopStore";
import type {JSX} from "react";

/**
 * The card for the weapon last made: its name and drawing, its power rating and its stats, in plain words, and **Try it**, which puts the weapon in slot 2 and in
 * hand on the practice range and shuts the workshop. Nothing shows before the first Make.
 */
export function WeaponCard(): JSX.Element | undefined {
  const weapon = useWorkshopStore(state => state.weapon);
  if (!weapon) {
    return undefined;
  }

  const name = weapon.identity?.name ?? "Weapon";
  const picture = weaponPictureUrl(weapon.identity?.key);
  const rating = Math.round(powerRatingOf(weapon) * 100);

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

      <button
        type="button"
        className="self-start rounded-md bg-gs-team-blue px-5 py-2 font-semibold text-gs-background"
        onClick={() => {
          useGameStore.getState().setWorld(worldWithWeaponOnTrial(gameState(), weapon));
          useAppStore.getState().closeWorkshop();
        }}
      >
        Try it
      </button>

      <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,14rem),1fr))] gap-x-5">
        {statRowsOf(weapon).map(row => (
          <StatRow key={row.label} label={row.label} value={row.value} />
        ))}
      </ul>
    </section>
  );
}
