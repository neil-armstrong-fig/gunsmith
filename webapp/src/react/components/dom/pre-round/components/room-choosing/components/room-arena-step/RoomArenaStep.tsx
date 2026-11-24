import {ArenaChoosing} from "@src/react/components/dom/pre-round/components/room-choosing/components/room-arena-step/components/arena-choosing/ArenaChoosing";
import {ArenaLockedIn} from "@src/react/components/dom/pre-round/components/room-choosing/components/room-arena-step/components/arena-locked-in/ArenaLockedIn";
import {useRoomPreRoundStore} from "@src/store/room-pre-round/UseRoomPreRoundStore";
import type {JSX} from "react";

/**
 * The arena step, opened once the player has locked in both weapons: choosing (`ArenaChoosing`) until the server says the arena is locked in, then
 * what was locked in, with the other player's arena once the server shows it (`ArenaLockedIn`). The other's arena is not shown before both have
 * locked in theirs.
 */
export function RoomArenaStep(): JSX.Element | undefined {
  const opened = useRoomPreRoundStore(state => state.readout?.own.slots[1].locked === true);
  const locked = useRoomPreRoundStore(state => state.readout?.own.arenaLocked === true);
  if (!opened) {
    return undefined;
  }

  return (
    <>
      {locked && <ArenaLockedIn />}

      {!locked && <ArenaChoosing />}
    </>
  );
}
