import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {DUEL_BUILT_IN_ARENA} from "@gunsmith/engine/arena/built-in/DuelBuiltInArena";
import {RIFLE} from "@gunsmith/engine/weapon/weapons/Rifle";
import {SUBMACHINE_GUN} from "@gunsmith/engine/weapon/weapons/SubmachineGun";
import {useBotPreRoundStore} from "@src/store/bot-pre-round/UseBotPreRoundStore";

const picks = {first: SUBMACHINE_GUN, second: RIFLE};
const duel = {id: "built-in:Duel", name: "Duel", arena: arenaFrom(DUEL_BUILT_IN_ARENA.rows)};

afterEach(() => {
  vi.unstubAllGlobals();
  useBotPreRoundStore.setState(useBotPreRoundStore.getInitialState(), true);
});

it("holds the phase, the picks, the arena and what changes them, and nothing else, so adding state is a deliberate edit", () => {
  expect(Object.keys(useBotPreRoundStore.getState()).sort()).toEqual([
    "arena",
    "lockIn",
    "phase",
    "picks",
    "restart",
    "startMatch",
  ]);
});

it("starts with the match on when the page asked for no pre-round", () => {
  expect(useBotPreRoundStore.getState().phase).toBe("fighting");
  expect(useBotPreRoundStore.getState().picks).toBeUndefined();
  expect(useBotPreRoundStore.getState().arena).toBeUndefined();
});

it("shows the reveal once the weapons and the arena are locked in, and keeps them", () => {
  useBotPreRoundStore.getState().lockIn(picks, duel);

  expect(useBotPreRoundStore.getState().phase).toBe("revealed");
  expect(useBotPreRoundStore.getState().picks).toBe(picks);
  expect(useBotPreRoundStore.getState().arena).toBe(duel);
});

it("starts the match from the reveal and keeps the picks and the arena for every round", () => {
  useBotPreRoundStore.getState().lockIn(picks, duel);
  useBotPreRoundStore.getState().startMatch();

  expect(useBotPreRoundStore.getState().phase).toBe("fighting");
  expect(useBotPreRoundStore.getState().picks).toBe(picks);
  expect(useBotPreRoundStore.getState().arena).toBe(duel);
});

it("puts the choosing back for a new match on a page that asked for the pre-round, forgetting everything locked in", () => {
  vi.stubGlobal("location", {search: "?scenario=duel&preRound=1"});
  useBotPreRoundStore.getState().lockIn(picks, duel);
  useBotPreRoundStore.getState().startMatch();

  useBotPreRoundStore.getState().restart();

  expect(useBotPreRoundStore.getState().phase).toBe("choosing");
  expect(useBotPreRoundStore.getState().picks).toBeUndefined();
  expect(useBotPreRoundStore.getState().arena).toBeUndefined();
});

it("puts nothing back on a page that asked for no pre-round", () => {
  vi.stubGlobal("location", {search: "?scenario=duel"});

  useBotPreRoundStore.getState().restart();

  expect(useBotPreRoundStore.getState().phase).toBe("fighting");
});
