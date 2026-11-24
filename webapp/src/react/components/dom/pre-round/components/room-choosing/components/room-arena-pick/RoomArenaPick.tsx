import {ArenaOption} from "@src/react/components/dom/pre-round/components/room-choosing/components/room-arena-pick/components/arena-option/ArenaOption";
import {useRoomPreRoundStore} from "@src/store/room-pre-round/UseRoomPreRoundStore";
import type {JSX} from "react";

const PICKS = [
  {pick: "mine", label: "Play my arena"},
  {pick: "theirs", label: "Play their arena"},
  {pick: "random", label: "Random"},
  {pick: "nothing", label: "Nothing"},
] as const;

/**
 * Shown while the server asks the two players to pick, which is when both have locked in an arena and the two differ: both arenas with a preview
 * each, and a choice of one of them, random, or nothing. Once the player has picked it waits for the other.
 */
export function RoomArenaPick(): JSX.Element | undefined {
  const stage = useRoomPreRoundStore(state => state.readout?.stage);
  const own = useRoomPreRoundStore(state => state.readout?.own);
  const opponent = useRoomPreRoundStore(state => state.readout?.opponent);
  if (stage !== "picking" || !own || !opponent) {
    return undefined;
  }

  return (
    <section data-testid="room-arena-pick" className="flex flex-col gap-3 text-gs-ui-text">
      <h2 className="text-lg font-semibold">You put forward different arenas: pick one</h2>

      <div className="flex gap-4">
        <ArenaOption title="Yours" arena={own.arena} />

        <ArenaOption title="Theirs" arena={opponent.arena} />
      </div>

      <div className="flex flex-wrap gap-2">
        {PICKS.map(({pick, label}) => (
          <button
            key={pick}
            type="button"
            disabled={own.picked}
            className="rounded-md bg-gs-background px-3 py-2 text-gs-ui-text disabled:opacity-50"
            onClick={() => {
              useRoomPreRoundStore.getState().wantPick(pick);
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {own.picked && <p>Waiting for the other player to pick.</p>}
    </section>
  );
}
