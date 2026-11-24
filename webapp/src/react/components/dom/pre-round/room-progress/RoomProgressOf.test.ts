import type {RoomPreRoundReadout} from "@src/game/room-pre-round/types/RoomPreRoundReadout";
import {roomProgressOf} from "@src/react/components/dom/pre-round/room-progress/RoomProgressOf";

const seat = {
  slots: [
    {locked: false, shown: undefined},
    {locked: false, shown: undefined},
  ],
  arena: undefined,
  arenaLocked: false,
  picked: false,
  ready: false,
} as const;
const readout: RoomPreRoundReadout = {
  stage: "choosing",
  secondsLeft: 30,
  own: seat,
  opponent: seat,
  how: undefined,
  reveal: undefined,
};

it("is empty when the server has said nothing", () => {
  expect(roomProgressOf(undefined)).toBe("");
});

it("changes with each step this player takes or the stage moves to, and not with the clock or the other player", () => {
  const before = roomProgressOf(readout);

  expect(roomProgressOf({...readout, secondsLeft: 12})).toBe(before);
  expect(roomProgressOf({...readout, opponent: {...seat, arenaLocked: true}})).toBe(before);
  expect(roomProgressOf({...readout, stage: "picking"})).not.toBe(before);
  expect(
    roomProgressOf({...readout, own: {...seat, slots: [{locked: true, shown: undefined}, seat.slots[1]]}}),
  ).not.toBe(before);
  expect(
    roomProgressOf({...readout, own: {...seat, slots: [seat.slots[0], {locked: true, shown: undefined}]}}),
  ).not.toBe(before);
  expect(roomProgressOf({...readout, own: {...seat, arenaLocked: true}})).not.toBe(before);
  expect(roomProgressOf({...readout, own: {...seat, picked: true}})).not.toBe(before);
  expect(roomProgressOf({...readout, own: {...seat, ready: true}})).not.toBe(before);
});
