import {RIFLE} from "@gunsmith/engine/weapon/weapons/Rifle";
import {SUBMACHINE_GUN} from "@gunsmith/engine/weapon/weapons/SubmachineGun";
import {usePreRoundStore} from "@src/store/pre-round/UsePreRoundStore";

const picks = {first: SUBMACHINE_GUN, second: RIFLE};

afterEach(() => {
  vi.unstubAllGlobals();
  usePreRoundStore.setState(usePreRoundStore.getInitialState(), true);
});

it("holds the phase, the picks and what changes them, and nothing else, so adding state is a deliberate edit", () => {
  expect(Object.keys(usePreRoundStore.getState()).sort()).toEqual([
    "lockIn",
    "phase",
    "picks",
    "restart",
    "startMatch",
  ]);
});

it("starts with the match on when the page asked for no pre-round", () => {
  expect(usePreRoundStore.getState().phase).toBe("fighting");
  expect(usePreRoundStore.getState().picks).toBeUndefined();
});

it("shows the reveal once the picks are locked in, and keeps them", () => {
  usePreRoundStore.getState().lockIn(picks);

  expect(usePreRoundStore.getState().phase).toBe("revealed");
  expect(usePreRoundStore.getState().picks).toBe(picks);
});

it("starts the match from the reveal and keeps the picks for every round", () => {
  usePreRoundStore.getState().lockIn(picks);
  usePreRoundStore.getState().startMatch();

  expect(usePreRoundStore.getState().phase).toBe("fighting");
  expect(usePreRoundStore.getState().picks).toBe(picks);
});

it("puts the choosing back for a new match on a page that asked for the pre-round, forgetting the picks", () => {
  vi.stubGlobal("location", {search: "?scenario=duel&preRound=1"});
  usePreRoundStore.getState().lockIn(picks);
  usePreRoundStore.getState().startMatch();

  usePreRoundStore.getState().restart();

  expect(usePreRoundStore.getState().phase).toBe("choosing");
  expect(usePreRoundStore.getState().picks).toBeUndefined();
});

it("puts nothing back on a page that asked for no pre-round", () => {
  vi.stubGlobal("location", {search: "?scenario=duel"});

  usePreRoundStore.getState().restart();

  expect(usePreRoundStore.getState().phase).toBe("fighting");
});
