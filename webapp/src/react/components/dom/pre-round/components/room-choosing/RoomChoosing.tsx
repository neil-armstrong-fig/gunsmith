import {RoomArenaPick} from "@src/react/components/dom/pre-round/components/room-choosing/components/room-arena-pick/RoomArenaPick";
import {RoomArenaStep} from "@src/react/components/dom/pre-round/components/room-choosing/components/room-arena-step/RoomArenaStep";
import {RoomReveal} from "@src/react/components/dom/pre-round/components/room-choosing/components/room-reveal/RoomReveal";
import {RoomStatus} from "@src/react/components/dom/pre-round/components/room-choosing/components/room-status/RoomStatus";
import {RoomWeaponStep} from "@src/react/components/dom/pre-round/components/room-choosing/components/room-weapon-step/RoomWeaponStep";
import {accountUrl} from "@src/account/AccountUrl";
import {useAccountLibraryStore} from "@src/store/account-library/UseAccountLibraryStore";
import {useOnlinePreRoundStore} from "@src/store/online-pre-round/UseOnlinePreRoundStore";
import type {JSX} from "react";
import {useEffect} from "react";

/**
 * A private room's pre-round, in the order the design gives: what the room waits for, then a weapon at a time (the second opens when the first is
 * locked in, so it can answer the other player's first), then the arena, then the pick between two arenas if they differ, then what was decided,
 * shown until both press Start the match or the time is up. Each step shows only once the server says the one before it is locked in. Opening it
 * asks for the player's account library (once, however many times it opens), so a room loaded directly offers their saved weapons and arenas.
 */
export function RoomChoosing(): JSX.Element {
  const revealing = useOnlinePreRoundStore(
    state => state.readout?.stage === "revealing" || state.readout?.stage === "decided",
  );

  useEffect(() => {
    void useAccountLibraryStore.getState().connect(accountUrl("/api/me"), accountUrl("/api/library"));
  }, []);

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
