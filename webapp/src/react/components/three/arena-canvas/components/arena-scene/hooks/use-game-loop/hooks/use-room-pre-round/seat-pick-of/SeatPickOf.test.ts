import {seatPickOf} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/hooks/use-room-pre-round/seat-pick-of/SeatPickOf";

it("names this seat's own arena for 'mine' and the other seat's for 'theirs'", () => {
  expect(seatPickOf("mine", "first")).toEqual({kind: "arena", seat: "first"});
  expect(seatPickOf("theirs", "first")).toEqual({kind: "arena", seat: "second"});
  expect(seatPickOf("mine", "second")).toEqual({kind: "arena", seat: "second"});
  expect(seatPickOf("theirs", "second")).toEqual({kind: "arena", seat: "first"});
});

it("needs no seat for random or nothing", () => {
  expect(seatPickOf("random", undefined)).toEqual({kind: "random"});
  expect(seatPickOf("nothing", undefined)).toEqual({kind: "nothing"});
});

it("gives nothing for an arena pick before the browser knows its seat", () => {
  expect(seatPickOf("mine", undefined)).toBeUndefined();
  expect(seatPickOf("theirs", undefined)).toBeUndefined();
});
