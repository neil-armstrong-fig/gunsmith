import {chosenChoiceOf} from "@src/react/components/dom/pre-round/components/choosing/choices/ChosenChoiceOf";
import {weaponChoicesOf} from "@src/react/components/dom/pre-round/components/choosing/choices/WeaponChoicesOf";
import {WeaponPicker} from "@src/react/components/dom/pre-round/components/choosing/components/weapon-picker/WeaponPicker";
import {nameOfShownWeapon} from "@src/react/components/dom/pre-round/components/room-choosing/components/room-weapon-step/shown-weapon-name/NameOfShownWeapon";
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
 * One weapon of the pre-round, which goes a weapon at a time: the built-ins to choose from and **Lock in weapon N** (beginning on what the player
 * locked in last time when that is a built-in), then, once the server says it is locked in, the weapon locked in and the other player's weapon in the
 * same slot, which the server shows only once both have locked in that slot (until then the screen says it waits). Saved weapons are not offered in
 * a room yet.
 */
export function RoomWeaponStep({slot}: Props): JSX.Element | undefined {
  const own = useRoomPreRoundStore(state => state.readout?.own.slots[slot - 1]);
  const opponent = useRoomPreRoundStore(state => state.readout?.opponent.slots[slot - 1]);
  const firstLocked = useRoomPreRoundStore(state => state.readout?.own.slots[0].locked);
  const wanted = useRoomPreRoundStore(state => state.wants.weapons[slot - 1]);
  const choices = useMemo(() => weaponChoicesOf([]), []);
  const [chosenId, setChosenId] = useState(() => rememberedIdOf(slot));
  const chosen = chosenChoiceOf(choices, chosenId, DEFAULT_WEAPON_IDS[slot]);
  if (!own || !chosen || (slot === 2 && !firstLocked)) {
    return undefined;
  }

  if (own.locked) {
    return (
      <div className="flex flex-col gap-1 text-gs-ui-text">
        <h2 className="text-lg font-semibold">{`Weapon ${slot}`}</h2>

        <p>
          {"Yours: "}

          <span data-testid={`room-weapon-${slot}-locked`} className="font-semibold">
            {own.shown && nameOfShownWeapon(own.shown)}
          </span>
        </p>

        {opponent?.shown && (
          <p>
            {"Theirs: "}

            <span data-testid={`room-opponent-weapon-${slot}`} className="font-semibold">
              {nameOfShownWeapon(opponent.shown)}
            </span>
          </p>
        )}

        {!opponent?.shown && (
          <p data-testid={`room-opponent-weapon-${slot}-waiting`}>
            {`Waiting for the other player to lock in their weapon ${slot}.`}
          </p>
        )}
      </div>
    );
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
          useRoomPreRoundStore.getState().wantWeapon(slot, chosen.id);
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
