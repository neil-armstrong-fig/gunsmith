import {SavedArenaSummary} from "@src/react/components/dom/workshop/components/arena-workshop/components/saved-arena-summary/SavedArenaSummary";
import type {ShelfArena} from "@src/store/shelf/arena/types/ShelfArena";
import type {JSX} from "react";

interface Props {
  arenas: readonly ShelfArena[];
  onReplace: (id: string) => void;
  onCancel: () => void;
}

export function ArenaReplacementPicker({arenas, onReplace, onCancel}: Props): JSX.Element {
  return (
    <div
      role="group"
      aria-label="Replace which arena?"
      className="flex w-full flex-col gap-2 rounded-md border border-gs-edge/40 px-3 py-2"
    >
      <p className="text-sm text-gs-ui-muted">The arena shelf is full. Replace which arena?</p>

      <ul className="flex flex-col gap-2">
        {arenas.map(item => (
          <li key={item.id} className="flex items-start justify-between gap-2 rounded-sm bg-gs-ui-surface p-2">
            <SavedArenaSummary saved={item} promptId={`replace-arena-${item.id}`} />

            <button
              type="button"
              aria-describedby={`replace-arena-${item.id}`}
              className="rounded-sm border border-gs-team-blue px-2 py-1 text-sm text-gs-team-blue"
              onClick={() => {
                onReplace(item.id);
              }}
            >
              Replace
            </button>
          </li>
        ))}
      </ul>

      <button type="button" className="self-start rounded-sm px-2 py-0.5 text-sm text-gs-ui-muted" onClick={onCancel}>
        Cancel
      </button>
    </div>
  );
}
