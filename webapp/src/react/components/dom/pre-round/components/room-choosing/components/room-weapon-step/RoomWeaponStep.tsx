import {WeaponChoosing} from "@src/react/components/dom/pre-round/components/room-choosing/components/room-weapon-step/components/weapon-choosing/WeaponChoosing";
import {WeaponLockedIn} from "@src/react/components/dom/pre-round/components/room-choosing/components/room-weapon-step/components/weapon-locked-in/WeaponLockedIn";
import {useOnlinePreRoundStore} from "@src/store/online-pre-round/UseOnlinePreRoundStore";
import type {JSX} from "react";

interface Props {
  slot: 1 | 2;
}

/**
 * One weapon of the pre-round, which goes a weapon at a time: choosing (`WeaponChoosing`) until the server says it is locked in, then what was
 * locked in, with the other player's weapon in the same slot once the server shows it (`WeaponLockedIn`). Slot 2 opens once slot 1 is locked in,
 * so the player sees the other's first weapon before choosing their second.
 */
export function RoomWeaponStep({slot}: Props): JSX.Element | undefined {
  const present = useOnlinePreRoundStore(state => state.readout !== undefined);
  const locked = useOnlinePreRoundStore(state => state.readout?.own.slots[slot - 1]?.locked === true);
  const firstLocked = useOnlinePreRoundStore(state => state.readout?.own.slots[0].locked === true);
  if (!present || (slot === 2 && !firstLocked)) {
    return undefined;
  }

  return (
    <>
      {locked && <WeaponLockedIn slot={slot} />}

      {!locked && <WeaponChoosing slot={slot} />}
    </>
  );
}
