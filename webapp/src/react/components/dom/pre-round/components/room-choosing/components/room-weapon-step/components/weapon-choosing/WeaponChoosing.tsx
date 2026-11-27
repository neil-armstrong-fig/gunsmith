import {chosenChoiceOf} from "@src/react/components/dom/pre-round/components/choosing/choices/ChosenChoiceOf";
import {weaponChoicesOf} from "@src/react/components/dom/pre-round/components/choosing/choices/WeaponChoicesOf";
import {WeaponPicker} from "@src/react/components/dom/pre-round/components/choosing/components/weapon-picker/WeaponPicker";
import {wantedWeaponOf} from "@src/react/components/dom/pre-round/components/room-choosing/components/room-weapon-step/components/weapon-choosing/wanted-weapon-of/WantedWeaponOf";
import {useAccountLibraryStore} from "@src/store/account-library/UseAccountLibraryStore";
import {usePreRoundChoicesStore} from "@src/store/pre-round-choices/UsePreRoundChoicesStore";
import {useRoomPreRoundStore} from "@src/store/room-pre-round/UseRoomPreRoundStore";
import type {JSX} from "react";
import {useMemo, useState} from "react";

interface Props {
  slot: 1 | 2;
}

/** What a player has chosen before they choose anything: the rifle in slot 1 and the marksman rifle in slot 2, as in a practice match. */
const DEFAULT_WEAPON_IDS = {1: "rifle", 2: "marksman-rifle"};

/**
 * Choosing a weapon for a slot: the built-ins, then the weapons saved in the player's account library (none for a guest), and **Lock in weapon N**,
 * beginning on what the player locked in last time when it is still on offer. A saved weapon is put forward by its library id; the browser's own
 * shelf is not offered, since the server cannot know its ids.
 */
export function WeaponChoosing({slot}: Props): JSX.Element | undefined {
  const wanted = useRoomPreRoundStore(state => state.wants.weapons[slot - 1]);
  const savedWeapons = useAccountLibraryStore(state => state.weapons);
  const choices = useMemo(() => weaponChoicesOf(savedWeapons), [savedWeapons]);
  const [chosenId, setChosenId] = useState(() => rememberedIdOf(slot));
  const chosen = chosenChoiceOf(choices, chosenId, DEFAULT_WEAPON_IDS[slot]);
  if (!chosen) {
    return undefined;
  }

  return (
    <>
      <WeaponPicker slot={slot} choices={choices} chosenId={chosen.id} onChoose={setChosenId} />

      <button
        type="button"
        disabled={wanted !== undefined}
        className="self-start rounded-md bg-gs-team-blue px-6 py-3 text-lg font-semibold text-gs-background disabled:opacity-50"
        onClick={() => {
          remember(slot, chosen.id);
          useRoomPreRoundStore.getState().wantWeapon(slot, wantedWeaponOf(chosen.id, savedWeapons));
        }}
      >
        {`Lock in weapon ${slot}`}
      </button>
    </>
  );
}

function rememberedIdOf(slot: 1 | 2): string | undefined {
  const remembered = usePreRoundChoicesStore.getState();
  if (slot === 1) {
    return remembered.firstWeaponId;
  }

  return remembered.secondWeaponId;
}

/** What the player locked in for this slot is what the next pre-round, in a room or against the bot, begins on. */
function remember(slot: 1 | 2, weaponId: string): void {
  const remembered = usePreRoundChoicesStore.getState();
  remembered.remember({
    firstWeaponId: slot === 1 ? weaponId : (remembered.firstWeaponId ?? DEFAULT_WEAPON_IDS[1]),
    secondWeaponId: slot === 2 ? weaponId : (remembered.secondWeaponId ?? DEFAULT_WEAPON_IDS[2]),
    arenaId: remembered.arenaId ?? "built-in:Duel",
  });
}
