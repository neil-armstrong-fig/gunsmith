import type {OnlineMatch} from "@src/online/OnlineMatch";
import {readoutOfFrame} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/hooks/use-room-pre-round/readout-of-frame/ReadoutOfFrame";
import {revealReadoutOf} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/hooks/use-room-pre-round/reveal-readout-of/RevealReadoutOf";
import {seatPickOf} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/hooks/use-room-pre-round/seat-pick-of/SeatPickOf";
import {sendsDue} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/hooks/use-room-pre-round/sends-due/SendsDue";
import type {DueAction} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/hooks/use-room-pre-round/sends-due/types/DueAction";
import type {MadeReveal} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/hooks/use-room-pre-round/types/MadeReveal";
import type {RoomPreRound} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/hooks/use-room-pre-round/types/RoomPreRound";
import {useRoomPreRoundStore} from "@src/store/room-pre-round/UseRoomPreRoundStore";
import {useMemo, useRef} from "react";

/**
 * The room's pre-round, kept in step with the server. After every frame it copies what the server said (`OnlineMatch.preRound()` and the reveal
 * frame) into the store, which the dialog reads, and **sends what the player locked in for as long as the server does not hold it**: a lock sent
 * while the socket was closed is dropped, and a seat that reconnected while alone gets a fresh one that knows nothing, so what the player wants
 * is sent again from what the server's own word disagrees with, not once. The pre-round goes in order, a weapon at a time, then the arena (the
 * pick if the two differ), then the ask to begin the match.
 */
export function useRoomPreRound(): RoomPreRound {
  const secondsSinceSendRef = useRef(Infinity);
  const madeRevealRef = useRef<MadeReveal>({frame: undefined, readout: undefined});

  return useMemo(
    () => ({
      afterFrame: ({onlineMatch, frameSeconds}) => {
        const frame = onlineMatch?.preRound();
        if (!onlineMatch || !frame) {
          useRoomPreRoundStore.getState().setReadout(undefined);

          return;
        }

        const reveal = onlineMatch.reveal();
        if (madeRevealRef.current.frame !== reveal) {
          madeRevealRef.current = {frame: reveal, readout: revealReadoutOf(reveal)};
        }
        const previous = useRoomPreRoundStore.getState().readout;
        useRoomPreRoundStore.getState().setReadout(
          readoutOfFrame({
            frame,
            reveal: madeRevealRef.current.readout,
            previous,
            opponentWeapons: onlineMatch.opponentWeapons(),
          }),
        );

        const {readout, wants} = useRoomPreRoundStore.getState();
        if (!readout) {
          return;
        }

        const due = sendsDue({readout, wants, secondsSinceSend: secondsSinceSendRef.current, frameSeconds});
        secondsSinceSendRef.current = due.secondsSinceSend;
        for (const action of due.actions) {
          send(onlineMatch, action);
        }
      },
    }),
    [],
  );
}

function send(onlineMatch: OnlineMatch, action: DueAction): void {
  if (action.kind === "weapon") {
    onlineMatch.chooseWeapon(action.slot, action.weapon);
    onlineMatch.lockInWeapon(action.slot);

    return;
  }

  if (action.kind === "arena") {
    onlineMatch.chooseArena(action.arena);
    onlineMatch.lockInArena();

    return;
  }

  if (action.kind === "pick") {
    const pick = seatPickOf(action.pick, onlineMatch.seat());
    if (pick) {
      onlineMatch.pickArena(pick);
    }

    return;
  }

  onlineMatch.readyForNextRound();
}
