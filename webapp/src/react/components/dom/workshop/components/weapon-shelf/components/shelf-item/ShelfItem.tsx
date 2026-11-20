import {SavedWeaponSummary} from "@src/react/components/dom/workshop/components/saved-weapon-summary/SavedWeaponSummary";
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

  return (
    <li data-testid="shelf-item" className="flex flex-col gap-2 rounded-md bg-gs-background px-3 py-2">
      <SavedWeaponSummary saved={saved} />

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
