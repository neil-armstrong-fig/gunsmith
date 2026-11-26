import {WeaponChoosing} from "@src/react/components/dom/pre-round/components/room-choosing/components/room-weapon-step/components/weapon-choosing/WeaponChoosing";
import {WeaponLockedIn} from "@src/react/components/dom/pre-round/components/room-choosing/components/room-weapon-step/components/weapon-locked-in/WeaponLockedIn";
import {useRoomPreRoundStore} from "@src/store/room-pre-round/UseRoomPreRoundStore";
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
  const present = useRoomPreRoundStore(state => state.readout !== undefined);
  const locked = useRoomPreRoundStore(state => state.readout?.own.slots[slot - 1]?.locked === true);
  const firstLocked = useRoomPreRoundStore(state => state.readout?.own.slots[0].locked === true);
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
