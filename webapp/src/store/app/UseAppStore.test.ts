import {useAppStore} from "@src/store/app/UseAppStore";

beforeEach(() => {
  useAppStore.setState(useAppStore.getInitialState(), true);
});

it("holds the choices about the game and nothing else, so adding state is a deliberate edit", () => {
  expect(Object.keys(useAppStore.getState()).sort()).toEqual([
    "askForNextRound",
    "closeWorkshop",
    "fogShown",
    "menuView",
    "muted",
    "nextRoundAsked",
    "openWorkshop",
    "reconnecting",
    "reducedMotion",
    "scenario",
    "setReconnecting",
    "setShowMenuOnStartup",
    "setWaitingForOtherPlayer",
    "shakePixels",
    "showMenu",
    "showMenuOnStartup",
    "takeNextRoundAsk",
    "toggleMuted",
    "waitingForOtherPlayer",
    "workshopOpen",
  ]);
});

it("starts with nothing asked and nobody waited for", () => {
  expect(useAppStore.getState().nextRoundAsked).toBe(false);
  expect(useAppStore.getState().waitingForOtherPlayer).toBe(false);
});

it("keeps the player's ask for the next round until the loop takes it, and gives it only once", () => {
  useAppStore.getState().askForNextRound();

  expect(useAppStore.getState().nextRoundAsked).toBe(true);
  expect(useAppStore.getState().takeNextRoundAsk()).toBe(true);
  expect(useAppStore.getState().nextRoundAsked).toBe(false);
  expect(useAppStore.getState().takeNextRoundAsk()).toBe(false);
});

it("remembers whether the other player is being waited for", () => {
  useAppStore.getState().setWaitingForOtherPlayer(true);

  expect(useAppStore.getState().waitingForOtherPlayer).toBe(true);

  useAppStore.getState().setWaitingForOtherPlayer(false);

  expect(useAppStore.getState().waitingForOtherPlayer).toBe(false);
});

it("remembers whether the connection is being made again, and starts with it not", () => {
  expect(useAppStore.getState().reconnecting).toBe(false);

  useAppStore.getState().setReconnecting(true);

  expect(useAppStore.getState().reconnecting).toBe(true);

  useAppStore.getState().setReconnecting(false);

  expect(useAppStore.getState().reconnecting).toBe(false);
});

it("starts with the sound on, as no page asks for it off", () => {
  expect(useAppStore.getState().muted).toBe(false);
});

it("starts with full motion and twelve pixels of shake, as no page asks for less", () => {
  expect(useAppStore.getState().reducedMotion).toBe(false);
  expect(useAppStore.getState().shakePixels).toBe(12);
});

it("turns the sound off and on again with each toggle", () => {
  useAppStore.getState().toggleMuted();

  expect(useAppStore.getState().muted).toBe(true);

  useAppStore.getState().toggleMuted();

  expect(useAppStore.getState().muted).toBe(false);
});

it("starts with the workshop shut, opens it and shuts it again", () => {
  expect(useAppStore.getState().workshopOpen).toBe(false);

  useAppStore.getState().openWorkshop();

  expect(useAppStore.getState().workshopOpen).toBe(true);

  useAppStore.getState().closeWorkshop();

  expect(useAppStore.getState().workshopOpen).toBe(false);
});

it("persists only the startup preference even while a submenu and other app state are active", () => {
  const {showMenu, setShowMenuOnStartup, toggleMuted} = useAppStore.getState();
  showMenu("options");
  setShowMenuOnStartup(false);
  toggleMuted();

  const {partialize} = useAppStore.persist.getOptions();
  expect(partialize?.(useAppStore.getState())).toEqual({showMenuOnStartup: false});
});
