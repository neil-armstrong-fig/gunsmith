import {RIFLE} from "@gunsmith/engine/weapon/weapons/Rifle";
import type {RoomPreRoundReadout} from "@src/game/room-pre-round/types/RoomPreRoundReadout";
import type {SeatReadout} from "@src/game/room-pre-round/types/SeatReadout";
import {sameReadout} from "@src/store/room-pre-round/same-readout/SameReadout";

const readout: RoomPreRoundReadout = {
  stage: "choosing",
  secondsLeft: 30,
  own: seat(),
  opponent: seat(),
  how: undefined,
  reveal: undefined,
};

it("says two readouts of the same content are the same", () => {
  expect(sameReadout(readout, {...readout, own: seat(), opponent: seat()})).toBe(true);
});

it("says two absent readouts are the same, and an absent one is not a present one", () => {
  expect(sameReadout(undefined, undefined)).toBe(true);
  expect(sameReadout(readout, undefined)).toBe(false);
  expect(sameReadout(undefined, readout)).toBe(false);
});

it("sees a change in each thing a readout says", () => {
  expect(sameReadout(readout, {...readout, stage: "picking"})).toBe(false);
  expect(sameReadout(readout, {...readout, secondsLeft: 29})).toBe(false);
  expect(sameReadout(readout, {...readout, secondsLeft: undefined})).toBe(false);
  expect(sameReadout(readout, {...readout, how: "coin"})).toBe(false);
});

it("sees a change in either seat: a lock, a weapon shown, an arena, a pick, a go-on", () => {
  const changed = (own: Partial<SeatReadout>): boolean => sameReadout(readout, {...readout, own: {...seat(), ...own}});
  const opponentChanged = (opponent: Partial<SeatReadout>): boolean =>
    sameReadout(readout, {...readout, opponent: {...seat(), ...opponent}});

  expect(changed({arenaLocked: true})).toBe(false);
  expect(changed({picked: true})).toBe(false);
  expect(changed({ready: true})).toBe(false);
  expect(changed({arena: {name: "Duel", rows: undefined}})).toBe(false);
  expect(changed({slots: [{locked: true, shown: undefined}, seat().slots[1]]})).toBe(false);
  expect(changed({slots: [seat().slots[0], {locked: false, shown: {kind: "builtIn", key: "rifle"}}]})).toBe(false);
  expect(opponentChanged({arenaLocked: true})).toBe(false);
  expect(opponentChanged({slots: [{locked: true, shown: {kind: "saved", name: "Sparky"}}, seat().slots[1]]})).toBe(
    false,
  );
});

it("tells one weapon shown from another by its key or its name (and whether its numbers came), and one arena shown from another by its name and drawing", () => {
  const withWeapon = (shown: SeatReadout["slots"][0]["shown"]): RoomPreRoundReadout => ({
    ...readout,
    opponent: {...seat(), slots: [{locked: true, shown}, seat().slots[1]]},
  });
  const withArena = (name: string, rows: readonly string[] | undefined): RoomPreRoundReadout => ({
    ...readout,
    opponent: {...seat(), arena: {name, rows}},
  });

  expect(sameReadout(withWeapon({kind: "builtIn", key: "rifle"}), withWeapon({kind: "builtIn", key: "rifle"}))).toBe(
    true,
  );
  expect(sameReadout(withWeapon({kind: "builtIn", key: "rifle"}), withWeapon({kind: "builtIn", key: "smg"}))).toBe(
    false,
  );
  expect(sameReadout(withWeapon({kind: "saved", name: "A"}), withWeapon({kind: "saved", name: "B"}))).toBe(false);
  expect(sameReadout(withWeapon({kind: "saved", name: "A"}), withWeapon({kind: "builtIn", key: "A"}))).toBe(false);
  expect(
    sameReadout(withWeapon({kind: "saved", name: "A"}), withWeapon({kind: "saved", name: "A", weapon: RIFLE})),
  ).toBe(false);
  expect(sameReadout(withArena("Duel", ["#"]), withArena("Duel", ["#"]))).toBe(true);
  expect(sameReadout(withArena("Duel", ["#"]), withArena("Duel", ["."]))).toBe(false);
  expect(sameReadout(withArena("Duel", ["#"]), withArena("Fair duel", ["#"]))).toBe(false);
});

function seat(): SeatReadout {
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
