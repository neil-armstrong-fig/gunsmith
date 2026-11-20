import type {ShelfArena} from "@src/store/shelf/arena/types/ShelfArena";
import type {JSX} from "react";

interface Props {
  saved: ShelfArena;
  promptId?: string;
}

export function SavedArenaSummary({saved, promptId}: Props): JSX.Element {
  return (
    <div className="min-w-0">
      <p className="font-semibold wrap-anywhere">
        {saved.name}
        <span className="ml-2 text-xs font-normal text-gs-ui-muted">
          {saved.rows[0]?.length} × {saved.rows.length}
        </span>
      </p>

      <p id={promptId} data-testid="saved-arena-prompt" className="mt-1 text-sm wrap-anywhere text-gs-ui-muted">
        {saved.prompt}
      </p>
    </div>
  );
}
