import type {JSX} from "react";

interface Props {
  onSave: () => void;
}

export function SaveWeaponButton({onSave}: Props): JSX.Element {
  return (
    <button
      type="button"
      className="rounded-md border border-gs-team-blue px-5 py-2 font-semibold text-gs-team-blue"
      onClick={onSave}
    >
      Save
    </button>
  );
}
