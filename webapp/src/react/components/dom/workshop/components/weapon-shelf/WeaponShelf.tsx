import {accountUrl} from "@src/account/AccountUrl";
import {useAccountLibraryStore} from "@src/store/account-library/UseAccountLibraryStore";
import {useState} from "react";
import {ShelfItem} from "@src/react/components/dom/workshop/components/weapon-shelf/components/shelf-item/ShelfItem";
import {useShelfStore} from "@src/store/shelf/UseShelfStore";
import type {JSX} from "react";

/** The weapons a player has saved, with how many of the shelf's places they fill. Saved weapons need no AI, so the shelf is there whatever the making is doing. */
export function WeaponShelf(): JSX.Element | undefined {
  const localWeapons = useShelfStore(state => state.weapons);
  const localLimit = useShelfStore(state => state.weaponLimit);
  const accountWeapons = useAccountLibraryStore(state => state.weapons);
  const accountLimit = useAccountLibraryStore(state => state.weaponLimit);
  const session = useAccountLibraryStore(state => state.session);
  const loadError = useAccountLibraryStore(state => state.error);
  const [removing, setRemoving] = useState(false);
  const [deleteError, setDeleteError] = useState<string>();
  if (session === "checking") return undefined;

  const signedIn = session === "signed-in";
  const shelves = {
    guest: {weapons: localWeapons, limit: localLimit},
    "signed-in": {weapons: accountWeapons, limit: accountLimit},
  };
  const {weapons, limit} = shelves[session];

  const remove = async (id: string): Promise<void> => {
    if (!signedIn) {
      useShelfStore.getState().deleteWeapon(id);
      return;
    }

    setRemoving(true);
    setDeleteError(undefined);
    const url = accountUrl("/api/library");
    try {
      await useAccountLibraryStore.getState().remove(url, id);
    } catch {
      setDeleteError("Could not delete the saved weapon.");
    } finally {
      setRemoving(false);
    }
  };

  return (
    <section aria-label="Weapon shelf" className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-sm font-semibold text-gs-ui-text">Saved weapons</h2>

        {limit !== undefined && (
          <p data-testid="shelf-count" className="font-mono text-sm text-gs-ui-muted tabular-nums">
            {weapons.length} of {limit}
          </p>
        )}
      </div>

      {limit !== undefined && weapons.length === 0 && (
        <p className="text-sm text-gs-ui-muted">Nothing saved yet. Make a weapon and press Save.</p>
      )}

      {weapons.length > 0 && (
        <ul className="flex flex-col gap-2">
          {weapons.map(saved => (
            <ShelfItem key={saved.id} saved={saved} signedIn={signedIn} removing={removing} onRemove={remove} />
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
