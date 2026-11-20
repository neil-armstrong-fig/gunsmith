import type {JSX} from "react";

export function SavedArenaButton(): JSX.Element {
  return (
    <button type="button" disabled className="rounded-md border border-gs-edge/40 px-4 py-1.5 text-gs-ui-muted">
      Saved
    </button>
  );
}
