import {arenaChoicesOf} from "@src/react/components/dom/pre-round/components/choosing/choices/ArenaChoicesOf";
import {chosenChoiceOf} from "@src/react/components/dom/pre-round/components/choosing/choices/ChosenChoiceOf";
import {ArenaPicker} from "@src/react/components/dom/pre-round/components/choosing/components/arena-picker/ArenaPicker";
import {usePreRoundChoicesStore} from "@src/store/pre-round-choices/UsePreRoundChoicesStore";
import {useRoomPreRoundStore} from "@src/store/room-pre-round/UseRoomPreRoundStore";
import type {JSX} from "react";
import {useMemo, useState} from "react";

const DUEL_ID = "built-in:Duel";

/**
 * The arena step before the player has locked in: the built-in arenas to put forward, a preview of the one chosen, and **Lock in arena**, which
 * waits (is disabled) once the player has asked for it until the server says it is locked in. Beginning on what the player locked in last time
 * when that is still offered. Saved arenas are not offered in a room yet.
 */
export function ArenaChoosing(): JSX.Element | undefined {
  const wanted = useRoomPreRoundStore(state => state.wants.arena);
  const choices = useMemo(() => arenaChoicesOf([]), []);
  const [chosenId, setChosenId] = useState(() => usePreRoundChoicesStore.getState().arenaId);
  const chosen = chosenChoiceOf(choices, chosenId, DUEL_ID);

  if (!chosen) {
    return undefined;
  }

  return (
    <>
      <ArenaPicker
        choices={choices}
        chosen={chosen}
        onChoose={choice => {
          setChosenId(choice.id);
        }}
      />

      <button
        type="button"
        disabled={wanted !== undefined}
        className="self-start rounded-md bg-gs-team-blue px-6 py-3 text-lg font-semibold text-gs-background disabled:opacity-50"
        onClick={() => {
          remember(chosen.id);
          useRoomPreRoundStore.getState().wantArena(chosen.name);
        }}
      >
        Lock in arena
      </button>
    </>
  );
}

/** What the player locked in for the arena is what the next pre-round begins on. */
function remember(arenaId: string): void {
  const remembered = usePreRoundChoicesStore.getState();
  remembered.remember({
    firstWeaponId: remembered.firstWeaponId ?? "rifle",
    secondWeaponId: remembered.secondWeaponId ?? "marksman-rifle",
    arenaId,
  });
}
