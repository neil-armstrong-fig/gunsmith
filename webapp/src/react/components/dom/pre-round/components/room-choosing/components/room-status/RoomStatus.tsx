import {roomOfPage} from "@src/online/RoomOfPage";
import {useRoomPreRoundStore} from "@src/store/room-pre-round/UseRoomPreRoundStore";
import type {JSX} from "react";

/**
 * What the room says of the pre-round at the top of the dialog: that the other player has not yet sat (with the friend code to give them, and no
 * clock, since the clock starts at their seat), and the seconds left, to choose and then to look at what was decided.
 */
export function RoomStatus(): JSX.Element | undefined {
  const secondsLeft = useRoomPreRoundStore(state => state.readout?.secondsLeft);
  const present = useRoomPreRoundStore(state => state.readout !== undefined);
  if (!present) {
    return undefined;
  }

  const friendCode = roomOfPage();

  return (
    <div className="flex flex-col gap-1 text-gs-ui-text">
      {secondsLeft === undefined && <p data-testid="room-waiting-to-sit">Waiting for the other player to sit.</p>}

      {secondsLeft === undefined && friendCode && (
        <p>
          {"Friend code: "}

          <span data-testid="room-friend-code" className="font-mono font-semibold">
            {friendCode}
          </span>
        </p>
      )}

      {secondsLeft !== undefined && (
        <p data-testid="room-clock" data-seconds-left={secondsLeft}>
          {`${secondsLeft} seconds left.`}
        </p>
      )}
    </div>
  );
}
