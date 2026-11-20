import type {JSX} from "react";

interface Props {
  onSave: () => void;
}

export function SaveArenaButton({onSave}: Props): JSX.Element {
  return (
    <button
      type="button"
      className="rounded-md border border-gs-team-blue px-4 py-1.5 font-semibold text-gs-team-blue"
      onClick={onSave}
    >
      Save
    </button>
  );
}
