import type {RoomPreRoundReadout} from "@src/game/room-pre-round/types/RoomPreRoundReadout";
import {useRoomPreRoundStore} from "@src/store/room-pre-round/UseRoomPreRoundStore";

const readout: RoomPreRoundReadout = {
  stage: "choosing",
  secondsLeft: undefined,
  builtInArenas: ["Duel", "Fair duel"],
  own: seat(),
  opponent: seat(),
  how: undefined,
  reveal: undefined,
};

afterEach(() => {
  useRoomPreRoundStore.setState(useRoomPreRoundStore.getInitialState(), true);
});

it("holds the readout, the wants and what changes them, and nothing else, so adding state is a deliberate edit", () => {
  expect(Object.keys(useRoomPreRoundStore.getState()).sort()).toEqual([
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
  expect(useRoomPreRoundStore.getState().readout).toBeUndefined();
  expect(useRoomPreRoundStore.getState().wants).toEqual({
    weapons: [undefined, undefined],
    arena: undefined,
    pick: undefined,
    start: false,
  });
});

it("keeps the readout it has when it is told the same again, so a reader that compares by identity does not run", () => {
  useRoomPreRoundStore.getState().setReadout(readout);
  const first = useRoomPreRoundStore.getState().readout;

  useRoomPreRoundStore.getState().setReadout({...readout, own: seat()});

  expect(useRoomPreRoundStore.getState().readout).toBe(first);
});

it("takes a readout that says something new", () => {
  useRoomPreRoundStore.getState().setReadout(readout);

  useRoomPreRoundStore.getState().setReadout({...readout, secondsLeft: 59});

  expect(useRoomPreRoundStore.getState().readout?.secondsLeft).toBe(59);
});

it("holds each want on its own: a weapon for each slot, an arena, a pick and the ask to start", () => {
  const store = useRoomPreRoundStore.getState();

  store.wantWeapon(1, {kind: "builtIn", key: "submachine-gun"});
  useRoomPreRoundStore.getState().wantWeapon(2, {kind: "saved", id: "weapon-from-the-library"});
  useRoomPreRoundStore.getState().wantArena({kind: "saved", id: "arena-from-the-library"});
  useRoomPreRoundStore.getState().wantPick("theirs");
  useRoomPreRoundStore.getState().wantToStart();

  expect(useRoomPreRoundStore.getState().wants).toEqual({
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
  useRoomPreRoundStore.getState().setReadout(readout);
  useRoomPreRoundStore.getState().wantWeapon(1, {kind: "builtIn", key: "rifle"});

  useRoomPreRoundStore.getState().setReadout({...readout, secondsLeft: 12});
  expect(useRoomPreRoundStore.getState().wants.weapons[0]).toEqual({kind: "builtIn", key: "rifle"});

  useRoomPreRoundStore.getState().setReadout(undefined);

  expect(useRoomPreRoundStore.getState().readout).toBeUndefined();
  expect(useRoomPreRoundStore.getState().wants.weapons[0]).toBeUndefined();
});

function seat(): RoomPreRoundReadout["own"] {
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
