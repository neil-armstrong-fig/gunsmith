import {SavedWeaponSummary} from "@src/react/components/dom/workshop/components/saved-weapon-summary/SavedWeaponSummary";
import type {ShelfWeapon} from "@src/store/shelf/types/ShelfWeapon";
import type {JSX} from "react";
import {useId} from "react";

interface Props {
  saved: ShelfWeapon;
  onReplace: (id: string) => void;
}

export function ReplacementChoice({saved, onReplace}: Props): JSX.Element {
  const promptId = useId();
  const name = saved.weapon.identity?.name ?? "Weapon";

  return (
    <li className="flex items-start gap-3 rounded-sm bg-gs-background px-3 py-2">
      <SavedWeaponSummary saved={saved} compact={false} promptId={promptId} />

      <button
        type="button"
        aria-label={`Replace ${name}`}
        aria-describedby={promptId}
        className="shrink-0 rounded-sm border border-gs-edge/40 px-2 py-1 text-sm text-gs-ui-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-team-blue"
        onClick={() => {
          onReplace(saved.id);
        }}
      >
        Replace
      </button>
    </li>
  );
}
