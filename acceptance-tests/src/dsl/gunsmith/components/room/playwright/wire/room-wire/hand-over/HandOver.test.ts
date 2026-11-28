import {Buffer} from "node:buffer";
import {expect, it} from "vitest";
import {HandOver} from "@src/dsl/gunsmith/components/room/playwright/wire/room-wire/hand-over/HandOver";

const JOINED = JSON.stringify({kind: "joined", seat: "first"});
const SNAPSHOT = JSON.stringify({kind: "snapshot", player: {loadout: []}});
const CHOOSING = JSON.stringify({
  kind: "preRound",
  own: {weapons: {slots: [{locked: true, choice: {kind: "builtIn", key: "rifle"}}, {locked: false}]}},
  opponent: {weapons: {slots: [{locked: true, choice: {kind: "builtIn", key: "rifle"}}, {locked: false}]}},
});

it("hands every frame over as the server sent it when nothing is asked of it", () => {
  const handOver = new HandOver({snapshotsPerHandover: 1, savedWeaponHolder: undefined});

  expect(handOver.framesFor(JOINED)).toEqual([JOINED]);
  expect(handOver.framesFor(SNAPSHOT)).toEqual([SNAPSHOT]);
  expect(handOver.framesFor(CHOOSING)).toEqual([CHOOSING]);
});

it("hands over only every nth snapshot, the first among them, and every other frame", () => {
  const handOver = new HandOver({snapshotsPerHandover: 3, savedWeaponHolder: undefined});

  const handed = [SNAPSHOT, JOINED, SNAPSHOT, SNAPSHOT, SNAPSHOT].map(frame => handOver.framesFor(frame).length);

  expect(handed).toEqual([1, 1, 0, 0, 1]);
});

it("hands a binary frame over unchanged", () => {
  const binary = Buffer.from([1, 2, 3]);

  expect(new HandOver({snapshotsPerHandover: 1, savedWeaponHolder: "opponent"}).framesFor(binary)).toEqual([binary]);
});

it("names the other seat's saved weapon in every choosing frame, and tells its numbers and drawing in the first only, as the server does once a connection", () => {
  const handOver = new HandOver({snapshotsPerHandover: 1, savedWeaponHolder: "opponent"});

  const first = handOver.framesFor(CHOOSING);
  const second = handOver.framesFor(CHOOSING);

  expect(first.map(kindOf)).toEqual(["opponentWeapon", "preRound"]);
  expect(second.map(kindOf)).toEqual(["preRound"]);
  expect(JSON.parse(String(second[0])).opponent.weapons.slots[0].choice).toEqual({kind: "saved", name: "Mint Coil"});
});

function kindOf(frame: string | Buffer): unknown {
  return JSON.parse(String(frame)).kind;
}
