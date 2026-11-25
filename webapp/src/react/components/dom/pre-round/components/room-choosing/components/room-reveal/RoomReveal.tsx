import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";
import {ArenaReveal} from "@src/react/components/dom/pre-round/components/arena-reveal/ArenaReveal";
import {Side} from "@src/react/components/dom/pre-round/components/side/Side";
import type {SlotWeapon} from "@src/react/components/dom/pre-round/components/side/types/SlotWeapon";
import {useRoomPreRoundStore} from "@src/store/room-pre-round/UseRoomPreRoundStore";
import type {JSX} from "react";
import {useMemo} from "react";

/** How the server says the arena was settled, in words a player reads: the engine's rule, or the same arena put forward twice. */
const HOW_TEXT: Record<string, string> = {
  same: "You both put forward this arena.",
  agreed: "You both picked the same arena.",
  coin: "You picked different arenas, so a coin chose.",
  "only-pick": "Only one of you picked, so that arena is played.",
  "pick-kept": "A pick was kept over random.",
  random: "The arena was drawn at random.",
};

/**
 * What was decided, shown before the match begins: both fighters' two weapons side by side with their ratings and stats, and beside them the arena with a preview and how it was settled, the
 * seconds left (the status above shows the clock) and **Start the match**, which begins it as soon as both players have pressed it.
 */
export function RoomReveal(): JSX.Element | undefined {
  const stage = useRoomPreRoundStore(state => state.readout?.stage);
  const reveal = useRoomPreRoundStore(state => state.readout?.reveal);
  const how = useRoomPreRoundStore(state => state.readout?.how);
  const ready = useRoomPreRoundStore(state => state.readout?.own.ready);
  const wanted = useRoomPreRoundStore(state => state.wants.start);
  const arena = useMemo(
    () => reveal && {id: reveal.arenaName, name: reveal.arenaName, arena: arenaFrom(reveal.arenaRows)},
    [reveal],
  );
  if ((stage !== "revealing" && stage !== "decided") || !reveal || !arena) {
    return undefined;
  }

  return (
    <div className="flex gap-6">
      <div data-testid="reveal" className="flex min-w-0 flex-1 gap-4">
        <Side testId="reveal-yours" title="You" weapons={inSlots(reveal.own)} />

        <Side testId="reveal-opponent" title="The other player" weapons={inSlots(reveal.opponent)} />
      </div>

      <div className="flex w-[22rem] shrink-0 flex-col gap-4">
        <ArenaReveal arena={arena} />

        {how && (
          <p data-testid="room-arena-how" className="text-gs-ui-text">
            {HOW_TEXT[how] ?? how}
          </p>
        )}

        <button
          type="button"
          disabled={wanted || ready}
          className="self-start rounded-md bg-gs-team-blue px-6 py-3 text-lg font-semibold text-gs-background disabled:opacity-50"
          onClick={() => {
            useRoomPreRoundStore.getState().wantToStart();
          }}
        >
          Start the match
        </button>

        {(wanted || ready) && (
          <p data-testid="room-start-waiting" className="text-gs-ui-text">
            Waiting for the other player to start.
          </p>
        )}
      </div>
    </div>
  );
}

function inSlots(weapons: readonly [Weapon, Weapon]): SlotWeapon[] {
  return weapons.map((weapon, position) => ({slot: position + 1, weapon}));
}
