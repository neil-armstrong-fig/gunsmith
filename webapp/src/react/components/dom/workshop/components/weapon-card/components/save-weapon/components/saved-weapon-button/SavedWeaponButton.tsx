import type {JSX} from "react";

export function SavedWeaponButton(): JSX.Element {
  return (
    <button type="button" disabled className="rounded-md border border-gs-edge/40 px-5 py-2 text-gs-ui-muted">
      Saved
    </button>
  );
}
