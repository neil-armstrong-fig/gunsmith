import {accountUrl} from "@src/account/AccountUrl";
import {useAccountArenaShelfStore} from "@src/store/shelf/arena/account/UseAccountArenaShelfStore";
import type {JSX} from "react";
import {useState} from "react";

interface Props {
  id: string;
}

export function SaveAccountArena({id}: Props): JSX.Element {
  const saved = useAccountArenaShelfStore(state => state.arenas.some(arena => arena.id === id));
  const loaded = useAccountArenaShelfStore(state => state.limit !== undefined);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();

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

  async function save(): Promise<void> {
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
        setError("Your arena shelf is full. Delete an arena before saving this one.");
        return;
      }
      if (!response.ok) throw new Error();

      await useAccountArenaShelfStore.getState().reload(url);
    } catch {
      setError("Could not save the arena.");
    } finally {
      setSaving(false);
    }
  }
}
