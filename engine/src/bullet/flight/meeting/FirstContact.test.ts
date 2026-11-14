import {firstContact} from "@gunsmith/engine/bullet/flight/meeting/FirstContact";
import type {Reach} from "@gunsmith/engine/bullet/flight/meeting/types/Reach";

function reach(changes: Partial<Reach>): Reach {
  return {wallDistance: Infinity, dummyHit: undefined, fighterDistance: undefined, ...changes};
}

function dummyAt(distance: number): Reach["dummyHit"] {
  return {dummyIndex: 0, distance};
}

it("meets nothing when nothing is in reach, and flies on", () => {
  expect(firstContact(reach({}))).toBe("none");
});

it("meets the wall when only a wall is in reach", () => {
  expect(firstContact(reach({wallDistance: 2}))).toBe("wall");
});

it("meets a dummy that is nearer than the wall", () => {
  expect(firstContact(reach({wallDistance: 2, dummyHit: dummyAt(1)}))).toBe("dummy");
});

it("meets the wall before a dummy that is further off", () => {
  expect(firstContact(reach({wallDistance: 1, dummyHit: dummyAt(2)}))).toBe("wall");
});

it("is shielded by a wall at the same distance as a dummy", () => {
  expect(firstContact(reach({wallDistance: 1, dummyHit: dummyAt(1)}))).toBe("wall");
});

it("meets a dummy with no wall in reach at all", () => {
  expect(firstContact(reach({dummyHit: dummyAt(1)}))).toBe("dummy");
});

it("meets a fighter that is nearer than the wall", () => {
  expect(firstContact(reach({wallDistance: 2, fighterDistance: 1}))).toBe("fighter");
});

it("meets the wall before a fighter that is further off", () => {
  expect(firstContact(reach({wallDistance: 1, fighterDistance: 2}))).toBe("wall");
});

it("is shielded by a wall at the same distance as a fighter", () => {
  expect(firstContact(reach({wallDistance: 1, fighterDistance: 1}))).toBe("wall");
});

it("meets a fighter with no wall in reach at all", () => {
  expect(firstContact(reach({fighterDistance: 1}))).toBe("fighter");
});

it("meets a fighter at distance zero, standing on the bullet", () => {
  expect(firstContact(reach({wallDistance: 1, fighterDistance: 0}))).toBe("fighter");
});

it("meets the dummy when it is nearer than a fighter", () => {
  expect(firstContact(reach({dummyHit: dummyAt(1), fighterDistance: 2}))).toBe("dummy");
});

it("meets the fighter when it is nearer than a dummy", () => {
  expect(firstContact(reach({dummyHit: dummyAt(2), fighterDistance: 1}))).toBe("fighter");
});

it("gives a dummy and a fighter at the same distance to the dummy", () => {
  expect(firstContact(reach({dummyHit: dummyAt(1), fighterDistance: 1}))).toBe("dummy");
});

it("meets a fighter that is nearer than the wall even when a dummy is beyond the wall", () => {
  expect(firstContact(reach({wallDistance: 2, dummyHit: dummyAt(3), fighterDistance: 1}))).toBe("fighter");
});

it("meets a dummy that is nearer than the wall even when a fighter is beyond the wall", () => {
  expect(firstContact(reach({wallDistance: 2, dummyHit: dummyAt(1), fighterDistance: 3}))).toBe("dummy");
});

it("meets the wall when a dummy and a fighter are both beyond it", () => {
  expect(firstContact(reach({wallDistance: 1, dummyHit: dummyAt(2), fighterDistance: 3}))).toBe("wall");
});
