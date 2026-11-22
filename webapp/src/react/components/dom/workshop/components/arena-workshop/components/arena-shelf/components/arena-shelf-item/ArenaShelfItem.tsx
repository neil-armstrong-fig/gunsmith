import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {ArenaPreview} from "@src/react/components/dom/arena-preview/ArenaPreview";
import {walkTheArena} from "@src/react/components/dom/workshop/arena-on-trial/WalkTheArena";
import {SavedArenaSummary} from "@src/react/components/dom/workshop/components/arena-workshop/components/saved-arena-summary/SavedArenaSummary";
import type {ShelfArena} from "@src/store/shelf/arena/types/ShelfArena";
import {useArenaWorkshopStore} from "@src/store/workshop/arena/UseArenaWorkshopStore";
import type {JSX} from "react";
import {useMemo} from "react";

interface Props {
  saved: ShelfArena;
  signedIn: boolean;
  removing: boolean;
  onRemove: (id: string) => Promise<void>;
}

export function ArenaShelfItem({saved, signedIn, removing, onRemove}: Props): JSX.Element {
  const arena = useMemo(() => arenaFrom(saved.rows), [saved.rows]);

  return (
    <li className="flex flex-col gap-2 rounded-md bg-gs-background px-3 py-2">
      <SavedArenaSummary saved={saved} />

      <div className="[--arena-preview-max-height:8rem]">
        <ArenaPreview arena={arena} name={saved.name} />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-sm bg-gs-team-blue px-3 py-1 text-sm font-semibold text-gs-background"
          onClick={() => {
            walkTheArena(arena);
          }}
        >
          Walk it
        </button>

        <button
          type="button"
          className="rounded-sm border border-gs-edge/40 px-3 py-1 text-sm"
          onClick={() => {
            useArenaWorkshopStore.getState().iterate(
              {
                arena,
                rows: saved.rows,
                name: saved.name,
                madeFromPrompt: saved.prompt,
                accountItemId: idOnAccount(signedIn, saved.id),
              },
              saved.id,
            );
          }}
        >
          Iterate
        </button>

        <button
          type="button"
          disabled={removing}
          className="rounded-sm border border-gs-edge/40 px-3 py-1 text-sm text-gs-ui-muted disabled:opacity-40"
          onClick={() => {
            void onRemove(saved.id);
          }}
        >
          Delete
        </button>
      </div>
    </li>
  );
}

function idOnAccount(signedIn: boolean, id: string): string | undefined {
  if (signedIn) return id;

  return undefined;
}
