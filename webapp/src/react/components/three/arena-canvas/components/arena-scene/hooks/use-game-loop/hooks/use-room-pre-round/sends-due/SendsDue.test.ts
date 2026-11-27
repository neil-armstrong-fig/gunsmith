import type {RoomPreRoundReadout} from "@src/game/room-pre-round/types/RoomPreRoundReadout";
import type {RoomWants} from "@src/game/room-pre-round/types/RoomWants";
import type {SeatReadout} from "@src/game/room-pre-round/types/SeatReadout";
import type {WantedArena} from "@src/game/room-pre-round/types/WantedArena";
import type {WantedWeapon} from "@src/game/room-pre-round/types/WantedWeapon";
import {sendsDue} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/hooks/use-room-pre-round/sends-due/SendsDue";

interface SeatFlags {
  firstLocked: boolean;
  secondLocked: boolean;
  arenaLocked: boolean;
  picked: boolean;
  ready: boolean;
}

const LONG_AGO = 100;
const frameSeconds = 0.016;
const rifle: WantedWeapon = {kind: "builtIn", key: "rifle"};
const submachineGun: WantedWeapon = {kind: "builtIn", key: "submachine-gun"};
const savedWeapon: WantedWeapon = {kind: "saved", id: "weapon-from-the-library"};
const duel: WantedArena = {kind: "builtIn", name: "Duel"};
const fairDuel: WantedArena = {kind: "builtIn", name: "Fair duel"};
const savedArena: WantedArena = {kind: "saved", id: "arena-from-the-library"};
const nothingWanted: RoomWants = {weapons: [undefined, undefined], arena: undefined, pick: undefined, start: false};
const nothingHeld: RoomPreRoundReadout = {
  stage: "choosing",
  secondsLeft: undefined,
  builtInArenas: ["Duel", "Fair duel"],
  own: seat({}),
  opponent: seat({}),
  how: undefined,
  reveal: undefined,
};

it("sends nothing when nothing is wanted", () => {
  expect(
    sendsDue({readout: nothingHeld, wants: nothingWanted, secondsSinceSend: LONG_AGO, frameSeconds}).actions,
  ).toEqual([]);
});

it("sends the first weapon at once when it is wanted and the server does not hold it", () => {
  const wants = {...nothingWanted, weapons: [submachineGun, undefined] as const};

  const due = sendsDue({readout: nothingHeld, wants, secondsSinceSend: LONG_AGO, frameSeconds});

  expect(due.actions).toEqual([{kind: "weapon", slot: 1, weapon: submachineGun}]);
  expect(due.secondsSinceSend).toBe(0);
});

it("does not send the second weapon until the server says the first is locked in", () => {
  const wants = {...nothingWanted, weapons: [submachineGun, rifle] as const};

  expect(sendsDue({readout: nothingHeld, wants, secondsSinceSend: LONG_AGO, frameSeconds}).actions).toEqual([
    {kind: "weapon", slot: 1, weapon: submachineGun},
  ]);

  const firstHeld = {...nothingHeld, own: seat({firstLocked: true})};

  expect(sendsDue({readout: firstHeld, wants, secondsSinceSend: LONG_AGO, frameSeconds}).actions).toEqual([
    {kind: "weapon", slot: 2, weapon: rifle},
  ]);
});

it("sends nothing of a weapon the server already holds", () => {
  const wants = {...nothingWanted, weapons: [rifle, rifle] as const};
  const held = {...nothingHeld, own: seat({firstLocked: true, secondLocked: true})};

  expect(sendsDue({readout: held, wants, secondsSinceSend: LONG_AGO, frameSeconds}).actions).toEqual([]);
});

it("sends the arena when it is wanted and the server does not hold it, and not once it does", () => {
  const wants = {...nothingWanted, arena: fairDuel};

  expect(sendsDue({readout: nothingHeld, wants, secondsSinceSend: LONG_AGO, frameSeconds}).actions).toEqual([
    {kind: "arena", arena: fairDuel},
  ]);

  const held = {...nothingHeld, own: seat({arenaLocked: true})};

  expect(sendsDue({readout: held, wants, secondsSinceSend: LONG_AGO, frameSeconds}).actions).toEqual([]);
});

it("sends a saved weapon by its library id for its own slot, as it stands", () => {
  const wants = {...nothingWanted, weapons: [rifle, savedWeapon] as const};
  const firstHeld = {...nothingHeld, own: seat({firstLocked: true})};

  expect(sendsDue({readout: firstHeld, wants, secondsSinceSend: LONG_AGO, frameSeconds}).actions).toEqual([
    {kind: "weapon", slot: 2, weapon: {kind: "saved", id: "weapon-from-the-library"}},
  ]);
});

it("sends a saved arena by its library id", () => {
  const wants = {...nothingWanted, arena: savedArena};

  expect(sendsDue({readout: nothingHeld, wants, secondsSinceSend: LONG_AGO, frameSeconds}).actions).toEqual([
    {kind: "arena", arena: {kind: "saved", id: "arena-from-the-library"}},
  ]);
});

it("sends the pick only while the server is asking for one, and not once it holds it", () => {
  const wants = {...nothingWanted, pick: "theirs"} as const;
  const picking = {...nothingHeld, stage: "picking"} as const;

  expect(sendsDue({readout: nothingHeld, wants, secondsSinceSend: LONG_AGO, frameSeconds}).actions).toEqual([]);
  expect(sendsDue({readout: picking, wants, secondsSinceSend: LONG_AGO, frameSeconds}).actions).toEqual([
    {kind: "pick", pick: "theirs"},
  ]);
  expect(
    sendsDue({readout: {...picking, own: seat({picked: true})}, wants, secondsSinceSend: LONG_AGO, frameSeconds})
      .actions,
  ).toEqual([]);
});

it("sends the ask to begin the match only while the decided arena and weapons are shown, and not once the server holds it", () => {
  const wants = {...nothingWanted, start: true};
  const revealing = {...nothingHeld, stage: "revealing"} as const;

  expect(sendsDue({readout: nothingHeld, wants, secondsSinceSend: LONG_AGO, frameSeconds}).actions).toEqual([]);
  expect(sendsDue({readout: revealing, wants, secondsSinceSend: LONG_AGO, frameSeconds}).actions).toEqual([
    {kind: "start"},
  ]);
  expect(
    sendsDue({readout: {...revealing, own: seat({ready: true})}, wants, secondsSinceSend: LONG_AGO, frameSeconds})
      .actions,
  ).toEqual([]);
});

it("does not send again while the last send may still be on its way, and counts the time", () => {
  const wants = {...nothingWanted, weapons: [rifle, undefined] as const};

  const due = sendsDue({readout: nothingHeld, wants, secondsSinceSend: 0, frameSeconds});

  expect(due.actions).toEqual([]);
  expect(due.secondsSinceSend).toBe(frameSeconds);
});

it("sends again once the wait is over and the server still holds nothing, as it must for a seat made new by a reconnection", () => {
  const wants = {...nothingWanted, weapons: [rifle, undefined] as const};
  let due = sendsDue({readout: nothingHeld, wants, secondsSinceSend: LONG_AGO, frameSeconds});
  expect(due.actions).toHaveLength(1);

  let sentAgain = false;
  for (let frame = 0; frame < 40; frame += 1) {
    due = sendsDue({readout: nothingHeld, wants, secondsSinceSend: due.secondsSinceSend, frameSeconds});
    sentAgain = sentAgain || due.actions.length > 0;
  }

  expect(sentAgain).toBe(true);
});

it("sends at once the first time something is wanted after nothing was, however recently it last sent", () => {
  const settled = sendsDue({readout: nothingHeld, wants: nothingWanted, secondsSinceSend: 0, frameSeconds});

  const due = sendsDue({
    readout: nothingHeld,
    wants: {...nothingWanted, arena: duel},
    secondsSinceSend: settled.secondsSinceSend,
    frameSeconds,
  });

  expect(due.actions).toEqual([{kind: "arena", arena: duel}]);
});

function seat(flags: Partial<SeatFlags>): SeatReadout {
  return {
    slots: [
      {locked: flags.firstLocked ?? false, shown: undefined},
      {locked: flags.secondLocked ?? false, shown: undefined},
    ],
    arena: undefined,
    arenaLocked: flags.arenaLocked ?? false,
    picked: flags.picked ?? false,
    ready: flags.ready ?? false,
  };
}
