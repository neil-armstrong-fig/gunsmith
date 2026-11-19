import {weaponPictureUrl} from "@src/assets/weapon-pictures/WeaponPictureUrl";
import {ratingPercentOf} from "@src/react/components/dom/workshop/rating-percent/RatingPercentOf";
import {tryOnTheRange} from "@src/react/components/dom/workshop/weapon-on-trial/TryOnTheRange";
import {useShelfStore} from "@src/store/shelf/UseShelfStore";
import type {ShelfWeapon} from "@src/store/shelf/types/ShelfWeapon";
import {useWorkshopStore} from "@src/store/workshop/UseWorkshopStore";
import type {JSX} from "react";

interface Props {
  saved: ShelfWeapon;
}

/** One saved weapon: its picture, name, power rating and the words it was made from, and what can be done with it: **Try it** on the range, **Iterate** on it in the workshop, **Delete**. */
export function ShelfItem({saved}: Props): JSX.Element {
  const {weapon} = saved;
  const name = weapon.identity?.name ?? "Weapon";
  const picture = weaponPictureUrl(weapon.identity?.key);

  return (
    <li data-testid="shelf-item" className="flex flex-col gap-2 rounded-md bg-gs-background px-3 py-2">
      <div className="flex items-center gap-3">
        {picture && (
          <img
            src={picture}
            alt=""
            width={40}
            height={40}
            className="size-10 shrink-0 rounded-sm border border-gs-edge/40 bg-gs-floor-l1 object-contain p-[3px]"
          />
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <p className="flex items-baseline justify-between gap-2">
            <span data-testid="shelf-item-name" className="min-w-0 truncate font-semibold text-gs-ui-text">
              {name}
            </span>

            <span className="font-mono text-sm whitespace-nowrap text-gs-ui-muted tabular-nums">
              <span data-testid="shelf-item-rating" className="text-gs-ui-text">
                {ratingPercentOf(weapon)}
              </span>
              {" / 100"}
            </span>
          </p>

          <p data-testid="shelf-item-prompt" className="line-clamp-2 text-sm wrap-anywhere text-gs-ui-muted">
            {saved.prompt}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          className="rounded-sm bg-gs-team-blue px-3 py-1 text-sm font-semibold text-gs-background"
          onClick={() => {
            tryOnTheRange(weapon);
          }}
        >
          Try it
        </button>

        <button
          type="button"
          className="rounded-sm border border-gs-edge/40 px-3 py-1 text-sm text-gs-ui-text"
          onClick={() => {
            useWorkshopStore.getState().showSavedWeapon(saved);
          }}
        >
          Iterate
        </button>

        <button
          type="button"
          className="rounded-sm border border-gs-edge/40 px-3 py-1 text-sm text-gs-ui-muted"
          onClick={() => {
            useShelfStore.getState().deleteWeapon(saved.id);
          }}
        >
          Delete
        </button>
      </div>
    </li>
  );
}
