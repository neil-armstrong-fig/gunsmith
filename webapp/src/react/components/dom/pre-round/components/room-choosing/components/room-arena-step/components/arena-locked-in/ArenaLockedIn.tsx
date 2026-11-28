import {useOnlinePreRoundStore} from "@src/store/online-pre-round/UseOnlinePreRoundStore";
import type {JSX} from "react";

/** The arena step once the player has locked in: their arena, and the other player's once the server shows it, which is only when both have locked in theirs. */
export function ArenaLockedIn(): JSX.Element {
  const ownName = useOnlinePreRoundStore(state => state.readout?.own.arena?.name);
  const opponentArena = useOnlinePreRoundStore(state => state.readout?.opponent.arena);

  return (
    <div className="flex flex-col gap-1 text-gs-ui-text">
      <h2 className="text-lg font-semibold">Arena</h2>

      <p>
        {"Yours: "}

        <span data-testid="room-arena-locked" className="font-semibold">
          {ownName}
        </span>
      </p>

      {opponentArena && (
        <p>
          {"Theirs: "}

          <span data-testid="room-opponent-arena" className="font-semibold">
            {opponentArena.name}
          </span>
        </p>
      )}

      {!opponentArena && <p>Waiting for the other player to lock in their arena.</p>}
    </div>
  );
}
