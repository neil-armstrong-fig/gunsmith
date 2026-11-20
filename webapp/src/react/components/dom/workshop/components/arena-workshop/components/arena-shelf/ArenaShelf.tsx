import {ArenaShelfItem} from "@src/react/components/dom/workshop/components/arena-workshop/components/arena-shelf/components/arena-shelf-item/ArenaShelfItem";
import {ARENA_SHELF_LIMIT} from "@src/store/shelf/arena/limits/ArenaShelfLimit";
import {useArenaShelfStore} from "@src/store/shelf/arena/UseArenaShelfStore";
import type {JSX} from "react";

export function ArenaShelf(): JSX.Element {
  const arenas = useArenaShelfStore(state => state.arenas);

  return (
    <section aria-label="Saved arenas" className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">Saved arenas</h2>

        <p className="text-sm tabular-nums text-gs-ui-muted">
          {arenas.length} of {ARENA_SHELF_LIMIT}
        </p>
      </div>

      {arenas.length > 0 && (
        <ul className="flex flex-col gap-2">
          {arenas.map(item => (
            <ArenaShelfItem key={item.id} saved={item} />
          ))}
        </ul>
      )}
    </section>
  );
}
