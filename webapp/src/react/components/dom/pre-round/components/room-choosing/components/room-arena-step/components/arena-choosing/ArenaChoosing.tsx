import {arenaChoicesOf} from "@src/react/components/dom/pre-round/components/choosing/choices/ArenaChoicesOf";
import {chosenChoiceOf} from "@src/react/components/dom/pre-round/components/choosing/choices/ChosenChoiceOf";
import {ArenaPicker} from "@src/react/components/dom/pre-round/components/choosing/components/arena-picker/ArenaPicker";
import {wantedArenaOf} from "@src/react/components/dom/pre-round/components/room-choosing/components/room-arena-step/components/arena-choosing/wanted-arena-of/WantedArenaOf";
import {useAccountLibraryStore} from "@src/store/account-library/UseAccountLibraryStore";
import {usePreRoundChoicesStore} from "@src/store/pre-round-choices/UsePreRoundChoicesStore";
import {useRoomPreRoundStore} from "@src/store/room-pre-round/UseRoomPreRoundStore";
import type {JSX} from "react";
import {useMemo, useState} from "react";

/**
 * The arena step before the player has locked in: the built-in arenas the room offers today, then the arenas saved in the player's account library
 * (none for a guest), a preview of the one chosen, and **Lock in arena**, which waits (is disabled) once the player has asked for it until the server says it
 * is locked in. Beginning on what the player locked in last time when that is still offered, else on the first of the day's arenas (the room's
 * own default). A saved arena is put forward by its library id.
 */
export function ArenaChoosing(): JSX.Element | undefined {
  const wanted = useRoomPreRoundStore(state => state.wants.arena);
  const savedArenas = useAccountLibraryStore(state => state.arenas);
  const offered = useRoomPreRoundStore(state => state.readout?.builtInArenas);
  const choices = useMemo(() => arenaChoicesOf(savedArenas, offered), [savedArenas, offered]);
  const [chosenId, setChosenId] = useState(() => usePreRoundChoicesStore.getState().arenaId);
  const chosen = chosenChoiceOf(choices, chosenId, `built-in:${offered?.[0]}`);

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
          useRoomPreRoundStore.getState().wantArena(wantedArenaOf(chosen, savedArenas));
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
