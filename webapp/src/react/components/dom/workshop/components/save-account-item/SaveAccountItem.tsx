import type {AccountItemKind} from "@src/account/types/AccountItemKind";
import {accountUrl} from "@src/account/AccountUrl";
import {useAccountLibraryStore} from "@src/store/account-library/UseAccountLibraryStore";
import type {JSX} from "react";
import {useState} from "react";

interface Props {
  id: string;
  kind: AccountItemKind;
}

export function SaveAccountItem({id, kind}: Props): JSX.Element {
  const saved = useAccountLibraryStore(state => {
    const entries = {arena: state.arenas, weapon: state.weapons}[kind];
    return entries.some(entry => entry.id === id);
  });
  const loaded = useAccountLibraryStore(
    state => ({arena: state.arenaLimit, weapon: state.weaponLimit})[kind] !== undefined,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();

  const save = async (): Promise<void> => {
    setSaving(true);
    setError(undefined);
    const url = accountUrl("/api/library");
    try {
      const response = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({id}),
      });
      if (response.status === 409) {
        const description = {arena: "an arena", weapon: "a weapon"}[kind];
        setError(`Your ${kind} shelf is full. Delete ${description} before saving this one.`);
        return;
      }
      if (!response.ok) throw new Error();

      await useAccountLibraryStore.getState().reload(url);
    } catch {
      setError(`Could not save the ${kind}.`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        disabled={saved || saving || !loaded}
        className="rounded-md border border-gs-team-blue px-4 py-1.5 font-semibold text-gs-team-blue disabled:opacity-40"
        onClick={() => {
          void save();
        }}
      >
        {saved && "Saved"}
        {!saved && saving && "Saving…"}
        {!saved && !saving && "Save"}
      </button>

      {error && (
        <p role="alert" className="text-sm text-gs-ring">
          {error}
        </p>
      )}
    </div>
  );
}
