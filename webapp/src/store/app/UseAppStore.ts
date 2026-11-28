import {botPreRoundOfPage} from "@src/game/bot-pre-round/BotPreRoundOfPage";
import {scenarioOfPage} from "@src/game/scenario/ScenarioOfPage";
import {reducedMotionOfPage} from "@src/store/app/motion/ReducedMotionOfPage";
import {shakePixelsOfPage} from "@src/store/app/motion/ShakePixelsOfPage";
import {fogShownOfPage} from "@src/store/app/fog/FogShownOfPage";
import {mutedOfPage} from "@src/store/app/sound/MutedOfPage";
import type {MenuView} from "@src/store/app/types/MenuView";
import type {AppStore} from "@src/store/app/types/AppStore";
import {z} from "zod";
import {create} from "zustand";
import type {StateStorage} from "zustand/middleware";
import {createJSONStorage, persist} from "zustand/middleware";

const STORAGE_NAME = "gunsmith.showMenuOnStartup";
const NO_STORAGE: StateStorage = {getItem: () => null, setItem: () => undefined, removeItem: () => undefined};
const startupPreferenceSchema = z.object({showMenuOnStartup: z.boolean()});
const startupMenuOverride = startupMenuOverrideOfPage();

/** The app store: choices about the game around the match, apart from the game store so a world written sixty times a second never wakes them. */
export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      muted: mutedOfPage(),
      reducedMotion: reducedMotionOfPage(),
      shakePixels: shakePixelsOfPage(),
      fogShown: fogShownOfPage(),
      toggleMuted: () => {
        set(state => ({muted: !state.muted}));
      },
      scenario: scenarioOfPage(),
      menuView: startupMenuView(true),
      showMenu: menuView => {
        set({menuView});
      },
      showMenuOnStartup: true,
      setShowMenuOnStartup: show => {
        set({showMenuOnStartup: show});
      },
      workshopOpen: false,
      openWorkshop: () => {
        set({workshopOpen: true, menuView: undefined});
      },
      closeWorkshop: () => {
        set({workshopOpen: false});
      },
      nextRoundAsked: false,
      askForNextRound: () => {
        set({nextRoundAsked: true});
      },
      takeNextRoundAsk: () => {
        const asked = get().nextRoundAsked;
        if (asked) {
          set({nextRoundAsked: false});
        }

        return asked;
      },
      waitingForOtherPlayer: false,
      setWaitingForOtherPlayer: waiting => {
        set({waitingForOtherPlayer: waiting});
      },
      reconnecting: false,
      setReconnecting: reconnecting => {
        set({reconnecting});
      },
    }),
    {
      name: STORAGE_NAME,
      storage: createJSONStorage(browserStorage, {reviver: reviveStartupPreference}),
      partialize: state => ({showMenuOnStartup: state.showMenuOnStartup}),
      merge: (persisted, current) => {
        const preference = startupPreferenceSchema.safeParse(persisted);
        const showMenuOnStartup = preference.data?.showMenuOnStartup ?? current.showMenuOnStartup;

        return {...current, showMenuOnStartup, menuView: startupMenuView(showMenuOnStartup)};
      },
    },
  ),
);

function startupMenuView(show: boolean): MenuView | undefined {
  if (startupMenuOverride ?? show) return "main";

  return undefined;
}

function startupMenuOverrideOfPage(): boolean | undefined {
  if (typeof location === "undefined") return false;

  if (scenarioOfPage() === "room" || botPreRoundOfPage()) return false;

  const address = new URL(location.href);
  const menu = address.searchParams.get("menu");
  if (menu === "1") {
    address.searchParams.delete("menu");
    history.replaceState(history.state, "", address);
    return true;
  }

  if (menu === "0") return false;

  return undefined;
}

function browserStorage(): StateStorage {
  if (typeof window === "undefined") return NO_STORAGE;

  return window.localStorage;
}

/** Earlier builds stored a bare boolean. Read it as the persisted startup preference. */
function reviveStartupPreference(key: string, value: unknown): unknown {
  if (key === "" && typeof value === "boolean") {
    return {state: {showMenuOnStartup: value}};
  }

  return value;
}
