import {loadLocalGameOfPage} from "@src/react/navigation/LoadLocalGameOfPage";
import {botGameAddressOf} from "@src/react/components/dom/game-menu/bot-game-address/BotGameAddressOf";
import {GameInformation} from "@src/react/components/dom/game-menu/components/game-information/GameInformation";
import {returnToMainMenu} from "@src/react/components/dom/game-menu/returning/ReturnToMainMenu";
import {RoomEntry} from "@src/react/components/dom/game-menu/components/room-entry/RoomEntry";
import {openPracticeWorkshop} from "@src/react/components/dom/workshop/entering/OpenPracticeWorkshop";
import type {MenuView} from "@src/store/app/types/MenuView";
import {useAppStore} from "@src/store/app/UseAppStore";
import type {JSX} from "react";
import {useEffect, useLayoutEffect, useRef} from "react";

const MENU_ACTION_STYLES =
  "rounded-md border border-gs-edge/25 bg-gs-background/45 px-4 py-2.5 text-left text-sm font-semibold hover:border-gs-team-blue/70 focus-visible:outline-2 focus-visible:outline-gs-team-blue";

export function GameMenu(): JSX.Element {
  const menuView = useAppStore(state => state.menuView);
  const workshopOpen = useAppStore(state => state.workshopOpen);
  const showOnStartup = useAppStore(state => state.showMenuOnStartup);
  const {showMenu, setShowMenuOnStartup} = useAppStore.getState();
  const open = menuView !== undefined;
  const scenario = useAppStore(state => state.scenario);
  const practice = scenario === "practice";
  const dialogRef = useRef<HTMLDialogElement>(null);
  const settingsRef = useRef<HTMLButtonElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    window.addEventListener("keydown", handleEscape, true);

    return () => {
      window.removeEventListener("keydown", handleEscape, true);
    };
  }, []);

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog) return undefined;

    const settings = settingsRef.current;
    const previouslyFocused = document.activeElement;
    dialog.showModal();

    return () => {
      dialog.close();
      if (useAppStore.getState().workshopOpen) return;

      if (
        previouslyFocused instanceof HTMLElement &&
        previouslyFocused !== document.body &&
        previouslyFocused.isConnected
      ) {
        previouslyFocused.focus();
        return;
      }

      settings?.focus();
    };
  }, [open]);

  useLayoutEffect(() => {
    if (menuView !== undefined) headingRef.current?.focus();
  }, [menuView]);

  return (
    <>
      {!workshopOpen && (
        <button
          ref={settingsRef}
          type="button"
          className="fixed bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-md border border-gs-edge/30 bg-gs-ui-surface/90 px-3 py-1.5 text-xs font-medium text-gs-ui-muted hover:text-gs-ui-text focus-visible:outline-2 focus-visible:outline-gs-team-blue"
          onMouseDown={event => {
            event.stopPropagation();
          }}
          onClick={() => {
            showMenu("main");
          }}
        >
          Settings
        </button>
      )}

      <dialog
        ref={dialogRef}
        aria-label="Game menu"
        className="m-auto max-h-[calc(100dvh-2rem)] w-[22rem] max-w-[calc(100vw-2rem)] overflow-y-auto rounded-lg border border-gs-edge/30 bg-gs-ui-surface p-5 text-gs-ui-text shadow-2xl backdrop:bg-gs-background/75"
        onCancel={event => {
          event.preventDefault();
          goBack();
        }}
        onKeyDown={event => {
          event.stopPropagation();
        }}
        onMouseDown={event => {
          event.stopPropagation();
        }}
      >
        <div className="flex flex-col gap-3">
          <h1 ref={headingRef} tabIndex={-1} className="mb-1 text-2xl font-bold tracking-wide outline-none">
            {headingOf(menuView)}
          </h1>

          {menuView === "main" && (
            <>
              {scenario === "room" && (
                <p className="text-sm text-gs-ui-muted">The match continues while this menu is open.</p>
              )}

              <button type="button" className={MENU_ACTION_STYLES} onClick={() => showMenu(undefined)}>
                Resume
              </button>

              {practice && (
                <>
                  <button type="button" className={MENU_ACTION_STYLES} onClick={openPracticeWorkshop}>
                    Workshop
                  </button>

                  <button
                    type="button"
                    className={MENU_ACTION_STYLES}
                    onClick={() => {
                      history.pushState(history.state, "", botGameAddressOf(location.search));
                      loadLocalGameOfPage(undefined);
                    }}
                  >
                    Start bot game
                  </button>

                  <button type="button" className={MENU_ACTION_STYLES} onClick={() => showMenu("online")}>
                    Start online game
                  </button>
                </>
              )}

              <button type="button" className={MENU_ACTION_STYLES} onClick={() => showMenu("options")}>
                Options
              </button>

              {!practice && (
                <button type="button" className={MENU_ACTION_STYLES} onClick={returnToMainMenu}>
                  Back to main menu
                </button>
              )}

              {practice && <GameInformation />}
            </>
          )}

          {menuView === "options" && (
            <label className="flex items-center gap-3 rounded-md bg-gs-background/45 px-4 py-3 text-sm">
              <input
                type="checkbox"
                className="size-4 accent-gs-team-blue"
                checked={showOnStartup}
                onChange={event => setShowMenuOnStartup(event.target.checked)}
              />
              Show menu on startup
            </label>
          )}

          {menuView === "online" && <RoomEntry />}

          {(menuView === "options" || menuView === "online") && (
            <button type="button" className={MENU_ACTION_STYLES} onClick={goBack}>
              Back
            </button>
          )}
        </div>
      </dialog>
    </>
  );
}

function headingOf(view: MenuView | undefined): string {
  if (view === "online") return "Start online game";

  if (view === "options") return "Options";

  return "Gunsmith";
}

function handleEscape(event: KeyboardEvent): void {
  if (event.code !== "Escape") return;

  event.preventDefault();
  event.stopPropagation();
  if (!event.repeat) goBack();
}

function goBack(): void {
  const {workshopOpen, closeWorkshop, menuView, showMenu} = useAppStore.getState();
  if (workshopOpen) {
    closeWorkshop();
    return;
  }

  if (menuView === "main") {
    showMenu(undefined);
    return;
  }

  showMenu("main");
}
