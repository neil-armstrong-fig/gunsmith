import {Choosing} from "@src/react/components/dom/pre-round/components/choosing/Choosing";
import {returnToMainMenu} from "@src/react/components/dom/game-menu/returning/ReturnToMainMenu";
import {Reveal} from "@src/react/components/dom/pre-round/components/reveal/Reveal";
import {RoomChoosing} from "@src/react/components/dom/pre-round/components/room-choosing/RoomChoosing";
import {roomProgressOf} from "@src/react/components/dom/pre-round/room-progress/RoomProgressOf";
import type {PreRoundShown} from "@src/react/components/dom/pre-round/types/PreRoundShown";
import type {RoomStage} from "@src/game/room-pre-round/types/RoomStage";
import {usePreRoundStore} from "@src/store/pre-round/UsePreRoundStore";
import type {PreRoundPhase} from "@src/store/pre-round/types/PreRoundPhase";
import {useRoomPreRoundStore} from "@src/store/room-pre-round/UseRoomPreRoundStore";
import type {JSX, KeyboardEvent} from "react";
import {useEffect, useRef} from "react";

/**
 * The pre-round: a panel over the dimmed arena of a duel opened with `?preRound=1`, where the player chooses a weapon for each slot and an arena, locks in and sees both fighters' weapons and the arena before round 1.
 * The game waits while it is up (`UseGameLoop` reads the store's phase), and the panel keeps its keys and mouse presses to itself, as the workshop does, so a click or a typed key is never the game's.
 * In a private room (`?room=<code>`) it is the room's pre-round instead, while the server says the two players are choosing or looking at what was decided; it goes with the first snapshot.
 */
export function PreRound(): JSX.Element | undefined {
  const phase = usePreRoundStore(state => state.phase);
  const inRoom = useRoomPreRoundStore(state => state.readout !== undefined);
  const roomProgress = useRoomPreRoundStore(state => roomProgressOf(state.readout));
  const roomStage = useRoomPreRoundStore(state => state.readout?.stage);
  const shown = shownOf(phase, inRoom);
  const panelRef = useRef<HTMLDivElement>(null);

  // Focus goes into the panel when it comes up, and again when the room's pre-round moves on (a button that was pressed has gone and left the focus on the page), so the keys pressed next reach it and not the page behind.
  useEffect(() => {
    if (shown) {
      panelRef.current?.focus();
    }
  }, [shown, roomProgress]);

  if (!shown) {
    return undefined;
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-gs-background/70"
      onKeyDown={keepToThePanel}
      onMouseDown={event => {
        event.stopPropagation();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-label="Pre-round"
        tabIndex={-1}
        data-wide={isRevealShown(shown, roomStage)}
        className="flex w-[40rem] max-h-[92vh] data-[wide=true]:w-[64rem] max-w-[90vw] flex-col gap-4 overflow-y-auto rounded-md bg-gs-ui-surface px-6 py-5 shadow-lg outline-none"
      >
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-wide text-gs-ui-text">Pre-round</h1>

          <button
            type="button"
            className="rounded-md border border-gs-edge/40 px-3 py-1.5 text-sm hover:border-gs-team-blue focus-visible:outline-2 focus-visible:outline-gs-team-blue"
            onClick={() => {
              if (shown === "revealed") {
                usePreRoundStore.getState().restart();
                return;
              }

              returnToMainMenu();
            }}
          >
            Back
          </button>
        </div>

        {shown === "choosing" && <Choosing />}

        {shown === "revealed" && <Reveal />}

        {shown === "room" && <RoomChoosing />}
      </div>
    </div>
  );
}

function shownOf(phase: PreRoundPhase, inRoom: boolean): PreRoundShown | undefined {
  if (phase !== "fighting") {
    return phase;
  }
  if (inRoom) {
    return "room";
  }

  return undefined;
}

/** Whether the panel shows a reveal, which lays the four weapons beside the arena and so needs more room than the choosing. */
function isRevealShown(shown: PreRoundShown, roomStage: RoomStage | undefined): boolean {
  if (shown === "revealed") {
    return true;
  }

  return shown === "room" && (roomStage === "revealing" || roomStage === "decided");
}

function keepToThePanel(event: KeyboardEvent): void {
  event.stopPropagation();
}
