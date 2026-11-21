import {Choosing} from "@src/react/components/dom/pre-round/components/choosing/Choosing";
import {Reveal} from "@src/react/components/dom/pre-round/components/reveal/Reveal";
import {usePreRoundStore} from "@src/store/pre-round/UsePreRoundStore";
import type {JSX, KeyboardEvent} from "react";
import {useEffect, useRef} from "react";

/**
 * The pre-round: a panel over the dimmed arena of a duel opened with `?preRound=1`, where the player chooses a weapon for each slot and an arena, locks in and sees both fighters' weapons and the arena before round 1.
 * The game waits while it is up (`UseGameLoop` reads the store's phase), and the panel keeps its keys and mouse presses to itself, as the workshop does, so a click or a typed key is never the game's.
 */
export function PreRound(): JSX.Element | undefined {
  const phase = usePreRoundStore(state => state.phase);
  const panelRef = useRef<HTMLDivElement>(null);

  // Focus goes into the panel when it comes up, so the keys pressed next reach it and not the page behind.
  useEffect(() => {
    if (phase !== "fighting") {
      panelRef.current?.focus();
    }
  }, [phase]);

  if (phase === "fighting") {
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
        className="flex w-[40rem] max-h-[92vh] max-w-[90vw] flex-col gap-4 overflow-y-auto rounded-md bg-gs-ui-surface px-6 py-5 shadow-lg outline-none"
      >
        <h1 className="text-2xl font-bold tracking-wide text-gs-ui-text">Pre-round</h1>

        {phase === "choosing" && <Choosing />}

        {phase === "revealed" && <Reveal />}
      </div>
    </div>
  );
}

function keepToThePanel(event: KeyboardEvent): void {
  event.stopPropagation();
}
