import {RoomArenaPick} from "@src/react/components/dom/pre-round/components/room-choosing/components/room-arena-pick/RoomArenaPick";
import {RoomArenaStep} from "@src/react/components/dom/pre-round/components/room-choosing/components/room-arena-step/RoomArenaStep";
import {RoomReveal} from "@src/react/components/dom/pre-round/components/room-choosing/components/room-reveal/RoomReveal";
import {RoomStatus} from "@src/react/components/dom/pre-round/components/room-choosing/components/room-status/RoomStatus";
import {RoomWeaponStep} from "@src/react/components/dom/pre-round/components/room-choosing/components/room-weapon-step/RoomWeaponStep";
import {useRoomPreRoundStore} from "@src/store/room-pre-round/UseRoomPreRoundStore";
import type {JSX} from "react";

/**
 * A private room's pre-round, in the order the design gives: what the room waits for, then a weapon at a time (the second opens when the first is
 * locked in, so it can answer the other player's first), then the arena, then the pick between two arenas if they differ, then what was decided,
 * shown until both press Start the match or the time is up. Each step shows only once the server says the one before it is locked in.
 */
export function RoomChoosing(): JSX.Element {
  const revealing = useRoomPreRoundStore(
    state => state.readout?.stage === "revealing" || state.readout?.stage === "decided",
  );

  return (
    <>
      <RoomStatus />

      {!revealing && (
        <>
          <RoomWeaponStep slot={1} />

          <RoomWeaponStep slot={2} />

          <RoomArenaStep />

          <RoomArenaPick />
        </>
      )}

      {revealing && <RoomReveal />}
    </>
  );
}
