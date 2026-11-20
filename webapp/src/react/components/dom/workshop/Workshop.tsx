import {ArenaWorkshop} from "@src/react/components/dom/workshop/components/arena-workshop/ArenaWorkshop";
import {WeaponCard} from "@src/react/components/dom/workshop/components/weapon-card/WeaponCard";
import {WeaponShelf} from "@src/react/components/dom/workshop/components/weapon-shelf/WeaponShelf";
import {WeaponPrompt} from "@src/react/components/dom/workshop/components/weapon-prompt/WeaponPrompt";
import {usePracticeResetKey} from "@src/react/components/dom/workshop/hooks/use-practice-reset-key/UsePracticeResetKey";
import {useWorkshopKey} from "@src/react/components/dom/workshop/hooks/use-workshop-key/UseWorkshopKey";
import {usePressedKey} from "@src/react/hooks/use-pressed-key/UsePressedKey";
import {useAppStore} from "@src/store/app/UseAppStore";
import type {JSX, KeyboardEvent} from "react";
import {useEffect, useRef, useState} from "react";

/**
 * The workshop: a panel over the dimmed practice range, opened by B, where a player makes a weapon. The game waits while it is open, and
 * the panel keeps its keys and its mouse presses to itself (a typed `w`, `r` or `m`, or a click, is never the game's). Escape shuts it.
 */
export function Workshop(): JSX.Element | undefined {
  useWorkshopKey();
  usePracticeResetKey();
  const open = useAppStore(state => state.workshopOpen);
  // Escape also shuts the panel when the focus has left it (a pressed Save turns disabled and the focus falls to the page); inside the panel its own handler does it first.
  usePressedKey("Escape", closeTheWorkshop, open);
  const [showArenas, setShowArenas] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Focus goes into the panel when it opens, so the keys typed next reach it (and Escape shuts it) and not the page behind.
  useEffect(() => {
    if (open) {
      panelRef.current?.focus();
    }
  }, [open]);

  if (!open) {
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
        aria-label="Workshop"
        tabIndex={-1}
        className="flex w-[40rem] max-h-[92vh] max-w-[90vw] flex-col gap-4 overflow-y-auto rounded-md bg-gs-ui-surface px-6 py-5 shadow-lg outline-none [@media(max-height:680px)]:gap-3 [@media(max-height:680px)]:py-3"
      >
        <h1 className="text-2xl font-bold tracking-wide text-gs-ui-text">Workshop</h1>

        <div className="flex gap-2">
          <button
            type="button"
            aria-pressed={!showArenas}
            className="rounded-sm px-2 py-1 text-sm aria-pressed:bg-gs-background"
            onClick={() => {
              setShowArenas(false);
            }}
          >
            Weapons
          </button>

          <button
            type="button"
            aria-pressed={showArenas}
            className="rounded-sm px-2 py-1 text-sm aria-pressed:bg-gs-background"
            onClick={() => {
              setShowArenas(true);
            }}
          >
            Arenas
          </button>
        </div>

        {!showArenas && (
          <>
            <WeaponPrompt />

            <WeaponCard />

            <WeaponShelf />
          </>
        )}

        {showArenas && <ArenaWorkshop />}
      </div>
    </div>
  );
}

function keepToThePanel(event: KeyboardEvent): void {
  event.stopPropagation();

  if (event.code === "Escape") {
    closeTheWorkshop();
  }
}

function closeTheWorkshop(): void {
  useAppStore.getState().closeWorkshop();
}
