import type {OnlinePreRoundReadout} from "@src/game/online-pre-round/types/OnlinePreRoundReadout";
import {useOnlinePreRoundStore} from "@src/store/online-pre-round/UseOnlinePreRoundStore";

const readout: OnlinePreRoundReadout = {
  stage: "choosing",
  secondsLeft: undefined,
  builtInArenas: ["Duel", "Fair duel"],
  own: seat(),
  opponent: seat(),
  how: undefined,
  reveal: undefined,
};

afterEach(() => {
  useOnlinePreRoundStore.setState(useOnlinePreRoundStore.getInitialState(), true);
});

it("holds the readout, the wants and what changes them, and nothing else, so adding state is a deliberate edit", () => {
  expect(Object.keys(useOnlinePreRoundStore.getState()).sort()).toEqual([
    "readout",
    "setReadout",
    "wantArena",
    "wantPick",
    "wantToStart",
    "wantWeapon",
    "wants",
  ]);
});

it("starts with nothing said and nothing wanted", () => {
  expect(useOnlinePreRoundStore.getState().readout).toBeUndefined();
  expect(useOnlinePreRoundStore.getState().wants).toEqual({
    weapons: [undefined, undefined],
    arena: undefined,
    pick: undefined,
    start: false,
  });
});

it("keeps the readout it has when it is told the same again, so a reader that compares by identity does not run", () => {
  useOnlinePreRoundStore.getState().setReadout(readout);
  const first = useOnlinePreRoundStore.getState().readout;

  useOnlinePreRoundStore.getState().setReadout({...readout, own: seat()});

  expect(useOnlinePreRoundStore.getState().readout).toBe(first);
});

it("takes a readout that says something new", () => {
  useOnlinePreRoundStore.getState().setReadout(readout);

  useOnlinePreRoundStore.getState().setReadout({...readout, secondsLeft: 59});

  expect(useOnlinePreRoundStore.getState().readout?.secondsLeft).toBe(59);
});

it("holds each want on its own: a weapon for each slot, an arena, a pick and the ask to start", () => {
  const store = useOnlinePreRoundStore.getState();

  store.wantWeapon(1, {kind: "builtIn", key: "submachine-gun"});
  useOnlinePreRoundStore.getState().wantWeapon(2, {kind: "saved", id: "weapon-from-the-library"});
  useOnlinePreRoundStore.getState().wantArena({kind: "saved", id: "arena-from-the-library"});
  useOnlinePreRoundStore.getState().wantPick("theirs");
  useOnlinePreRoundStore.getState().wantToStart();

  expect(useOnlinePreRoundStore.getState().wants).toEqual({
    weapons: [
      {kind: "builtIn", key: "submachine-gun"},
      {kind: "saved", id: "weapon-from-the-library"},
    ],
    arena: {kind: "saved", id: "arena-from-the-library"},
    pick: "theirs",
    start: true,
  });
});

it("forgets what was wanted once the pre-round is over, and keeps it while it goes on", () => {
  useOnlinePreRoundStore.getState().setReadout(readout);
  useOnlinePreRoundStore.getState().wantWeapon(1, {kind: "builtIn", key: "rifle"});

  useOnlinePreRoundStore.getState().setReadout({...readout, secondsLeft: 12});
  expect(useOnlinePreRoundStore.getState().wants.weapons[0]).toEqual({kind: "builtIn", key: "rifle"});

  useOnlinePreRoundStore.getState().setReadout(undefined);

  expect(useOnlinePreRoundStore.getState().readout).toBeUndefined();
  expect(useOnlinePreRoundStore.getState().wants.weapons[0]).toBeUndefined();
});

function seat(): OnlinePreRoundReadout["own"] {
  return {
    slots: [
      {locked: false, shown: undefined},
      {locked: false, shown: undefined},
    ],
    arena: undefined,
    arenaLocked: false,
    picked: false,
    ready: false,
  };
}
