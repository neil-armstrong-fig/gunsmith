import {accountUrl} from "@src/account/AccountUrl";
import {ArenaShelfItem} from "@src/react/components/dom/workshop/components/arena-workshop/components/arena-shelf/components/arena-shelf-item/ArenaShelfItem";
import {useAccountLibraryStore} from "@src/store/account-library/UseAccountLibraryStore";
import {ARENA_SHELF_LIMIT} from "@src/store/shelf/arena/limits/ArenaShelfLimit";
import {useArenaShelfStore} from "@src/store/shelf/arena/UseArenaShelfStore";
import type {JSX} from "react";
import {useState} from "react";

export function ArenaShelf(): JSX.Element {
  const localArenas = useArenaShelfStore(state => state.arenas);
  const session = useAccountLibraryStore(state => state.session);
  const accountArenas = useAccountLibraryStore(state => state.arenas);
  const accountLimit = useAccountLibraryStore(state => state.arenaLimit);
  const loadError = useAccountLibraryStore(state => state.error);
  const [removing, setRemoving] = useState(false);
  const [deleteError, setDeleteError] = useState<string>();

  const signedIn = session === "signed-in";
  if (session === "checking") return <></>;

  const shelves = {
    guest: {arenas: localArenas, limit: ARENA_SHELF_LIMIT},
    "signed-in": {arenas: accountArenas, limit: accountLimit},
  };
  const {arenas, limit} = shelves[session];

  const remove = async (id: string): Promise<void> => {
    if (!signedIn) {
      useArenaShelfStore.getState().remove(id);
      return;
    }

    setRemoving(true);
    setDeleteError(undefined);
    const url = accountUrl("/api/library");
    try {
      await useAccountLibraryStore.getState().remove(url, id);
    } catch {
      setDeleteError("Could not delete the saved arena.");
    } finally {
      setRemoving(false);
    }
  };

  return (
    <section aria-label="Saved arenas" className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">Saved arenas</h2>

        {limit !== undefined && (
          <p className="text-sm tabular-nums text-gs-ui-muted">
            {arenas.length} of {limit}
          </p>
        )}
      </div>

      {arenas.length > 0 && (
        <ul className="flex flex-col gap-2">
          {arenas.map(item => (
            <ArenaShelfItem key={item.id} saved={item} signedIn={signedIn} removing={removing} onRemove={remove} />
          ))}
        </ul>
      )}

      {loadError && (
        <div role="alert" className="text-sm text-gs-ring">
          {loadError}{" "}
          <button
            type="button"
            className="underline"
            onClick={() => {
              void useAccountLibraryStore.getState().reload(accountUrl("/api/library"));
            }}
          >
            Retry
          </button>
        </div>
      )}

      {deleteError && (
        <p role="alert" className="text-sm text-gs-ring">
          {deleteError}
        </p>
      )}
    </section>
  );
}
