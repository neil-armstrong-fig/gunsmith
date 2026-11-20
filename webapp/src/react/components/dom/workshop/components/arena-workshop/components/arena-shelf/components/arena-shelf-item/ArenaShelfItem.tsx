import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {walkTheArena} from "@src/react/components/dom/workshop/arena-on-trial/WalkTheArena";
import {SavedArenaSummary} from "@src/react/components/dom/workshop/components/arena-workshop/components/saved-arena-summary/SavedArenaSummary";
import {useArenaShelfStore} from "@src/store/shelf/arena/UseArenaShelfStore";
import type {ShelfArena} from "@src/store/shelf/arena/types/ShelfArena";
import {useArenaWorkshopStore} from "@src/store/workshop/arena/UseArenaWorkshopStore";
import type {JSX} from "react";

interface Props {
  saved: ShelfArena;
}

export function ArenaShelfItem({saved}: Props): JSX.Element {
  return (
    <li className="flex flex-col gap-2 rounded-md bg-gs-background px-3 py-2">
      <SavedArenaSummary saved={saved} />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-sm bg-gs-team-blue px-3 py-1 text-sm font-semibold text-gs-background"
          onClick={() => {
            walkTheArena(arenaFrom(saved.rows));
          }}
        >
          Walk it
        </button>

        <button
          type="button"
          className="rounded-sm border border-gs-edge/40 px-3 py-1 text-sm"
          onClick={() => {
            useArenaWorkshopStore
              .getState()
              .iterate(
                {arena: arenaFrom(saved.rows), rows: saved.rows, name: saved.name, madeFromPrompt: saved.prompt},
                saved.id,
              );
          }}
        >
          Iterate
        </button>

        <button
          type="button"
          className="rounded-sm border border-gs-edge/40 px-3 py-1 text-sm text-gs-ui-muted"
          onClick={() => {
            useArenaShelfStore.getState().remove(saved.id);
          }}
        >
          Delete
        </button>
      </div>
    </li>
  );
}
