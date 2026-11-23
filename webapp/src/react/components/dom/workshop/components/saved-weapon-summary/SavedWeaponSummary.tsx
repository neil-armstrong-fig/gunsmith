import {weaponAppearances} from "@src/assets/weapon-drawings/appearances/WeaponAppearances";
import {weaponPictureUrl} from "@src/assets/weapon-pictures/WeaponPictureUrl";
import {ratingPercentOf} from "@src/react/components/dom/workshop/rating-percent/RatingPercentOf";
import type {ShelfWeapon} from "@src/store/shelf/types/ShelfWeapon";
import type {JSX} from "react";

interface Props {
  saved: ShelfWeapon;
  compact?: boolean;
  promptId?: string;
}

export function SavedWeaponSummary({saved, compact = true, promptId}: Props): JSX.Element {
  const {weapon} = saved;
  const name = weapon.identity?.name ?? "Weapon";
  const picture = weaponPictureUrl(weapon.identity?.key, weaponAppearances.get(weapon));

  return (
    <div className="flex min-w-0 flex-1 items-start gap-3">
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
          <span
            data-testid="shelf-item-name"
            data-compact={compact}
            className="min-w-0 font-semibold wrap-anywhere text-gs-ui-text data-[compact=true]:truncate"
          >
            {name}
          </span>

          <span className="font-mono text-sm whitespace-nowrap text-gs-ui-muted tabular-nums">
            <span data-testid="shelf-item-rating" className="text-gs-ui-text">
              {ratingPercentOf(weapon)}
            </span>
            {" / 100"}
          </span>
        </p>

        <p
          id={promptId}
          data-testid="shelf-item-prompt"
          data-compact={compact}
          className="text-sm wrap-anywhere text-gs-ui-muted data-[compact=false]:whitespace-pre-wrap data-[compact=true]:line-clamp-2"
        >
          {saved.prompt}
        </p>
      </div>
    </div>
  );
}
