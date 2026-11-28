import {OpponentWeapon} from "@src/react/components/dom/pre-round/components/room-choosing/components/room-weapon-step/components/weapon-locked-in/components/opponent-weapon/OpponentWeapon";
import {nameOfShownWeapon} from "@src/react/components/dom/pre-round/components/room-choosing/components/room-weapon-step/components/weapon-locked-in/shown-weapon-name/NameOfShownWeapon";
import {useOnlinePreRoundStore} from "@src/store/online-pre-round/UseOnlinePreRoundStore";
import type {JSX} from "react";

interface Props {
  slot: 1 | 2;
}

/** A weapon once the player has locked it in: theirs by name, and the other player's in the same slot once the server shows it, which is only when both have locked in that slot. */
export function WeaponLockedIn({slot}: Props): JSX.Element {
  const own = useOnlinePreRoundStore(state => state.readout?.own.slots[slot - 1]?.shown);
  const opponentShown = useOnlinePreRoundStore(state => state.readout?.opponent.slots[slot - 1]?.shown !== undefined);

  return (
    <div className="flex flex-col gap-1 text-gs-ui-text">
      <h2 className="text-lg font-semibold">{`Weapon ${slot}`}</h2>

      <p>
        {"Yours: "}

        <span data-testid={`room-weapon-${slot}-locked`} className="font-semibold">
          {own && nameOfShownWeapon(own)}
        </span>
      </p>

      {opponentShown && <OpponentWeapon slot={slot} />}

      {!opponentShown && (
        <p data-testid={`room-opponent-weapon-${slot}-waiting`}>
          {`Waiting for the other player to lock in their weapon ${slot}.`}
        </p>
      )}
    </div>
  );
}
