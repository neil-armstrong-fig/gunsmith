import type {PreRoundFrame} from "@src/online/types/pre-round/PreRoundFrame";
import {readoutOfFrame} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/hooks/use-room-pre-round/readout-of-frame/ReadoutOfFrame";
import type {RevealReadout} from "@src/game/room-pre-round/types/RevealReadout";

const alone: PreRoundFrame = {
  kind: "preRound",
  stage: "choosing",
  builtInArenas: ["Duel", "Keep", "Slalom", "Pinwheel", "Catwalk"],
  own: {locked: false, weapons: {slots: [{locked: false}, {locked: false}]}},
  opponent: {locked: false, picked: false, weapons: {slots: [{locked: false}, {locked: false}]}},
};

it("says there is no clock while the other player has not sat, and nothing locked or shown", () => {
  expect(readoutOfFrame({frame: alone, reveal: undefined})).toEqual({
    stage: "choosing",
    secondsLeft: undefined,
    how: undefined,
    reveal: undefined,
    own: seatOf({}),
    opponent: seatOf({}),
  });
});

it("rounds the clock up to a whole second, so a clock that has not run out never says 0", () => {
  expect(readoutOfFrame({frame: {...alone, secondsLeft: 59.2}, reveal: undefined}).secondsLeft).toBe(60);
  expect(readoutOfFrame({frame: {...alone, secondsLeft: 12}, reveal: undefined}).secondsLeft).toBe(12);
  expect(readoutOfFrame({frame: {...alone, secondsLeft: 0.01}, reveal: undefined}).secondsLeft).toBe(1);
});

it("reads each weapon's lock and what is shown of it, for either seat", () => {
  const readout = readoutOfFrame({
    frame: {
      ...alone,
      own: {
        locked: false,
        weapons: {slots: [{locked: true, choice: {kind: "builtIn", key: "rifle"}}, {locked: false}]},
      },
      opponent: {
        locked: false,
        picked: false,
        weapons: {slots: [{locked: true, choice: {kind: "saved", name: "Sparky"}}, {locked: true}]},
      },
    },
    reveal: undefined,
  });

  expect(readout.own.slots).toEqual([
    {locked: true, shown: {kind: "builtIn", key: "rifle"}},
    {locked: false, shown: undefined},
  ]);
  expect(readout.opponent.slots).toEqual([
    {locked: true, shown: {kind: "saved", name: "Sparky"}},
    {locked: true, shown: undefined},
  ]);
});

it("reads the arena lock apart from the weapon locks, and a pick for this seat and for the other", () => {
  const readout = readoutOfFrame({
    frame: {
      ...alone,
      stage: "picking",
      own: {...alone.own, locked: true, pick: {kind: "random"}},
      opponent: {...alone.opponent, locked: true, picked: true},
    },
    reveal: undefined,
  });

  expect(readout.own).toMatchObject({arenaLocked: true, picked: true});
  expect(readout.opponent).toMatchObject({arenaLocked: true, picked: true});
  expect(readoutOfFrame({frame: alone, reveal: undefined}).own).toMatchObject({arenaLocked: false, picked: false});
});

it("gives the rows of a built-in arena from the page's own list, and of a saved one from the frame", () => {
  const readout = readoutOfFrame({
    frame: {
      ...alone,
      own: {...alone.own, arena: {kind: "builtIn", name: "Duel"}},
      opponent: {...alone.opponent, arena: {kind: "saved", name: "Little room", rows: ["###"]}},
    },
    reveal: undefined,
  });

  expect(readout.own.arena?.name).toBe("Duel");
  expect(readout.own.arena?.rows?.length).toBeGreaterThan(3);
  expect(readout.opponent.arena).toEqual({name: "Little room", rows: ["###"]});
});

it("reads who has asked to begin the match, how the arena was settled and the reveal it is given", () => {
  const reveal: RevealReadout = {arenaName: "Duel", arenaRows: [], own: [] as never, opponent: [] as never};
  const readout = readoutOfFrame({
    frame: {
      ...alone,
      stage: "revealing",
      how: "same",
      own: {...alone.own, ready: true},
      opponent: {...alone.opponent, ready: false},
    },
    reveal,
  });

  expect(readout).toMatchObject({stage: "revealing", how: "same", reveal});
  expect(readout.own.ready).toBe(true);
  expect(readout.opponent.ready).toBe(false);
});

function seatOf(overrides: object): object {
  return {
    slots: [
      {locked: false, shown: undefined},
      {locked: false, shown: undefined},
    ],
    arena: undefined,
    arenaLocked: false,
    picked: false,
    ready: false,
    ...overrides,
  };
}
