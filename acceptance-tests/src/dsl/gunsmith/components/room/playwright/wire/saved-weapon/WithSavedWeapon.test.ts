import {expect, it} from "vitest";
import {withSavedWeapon} from "@src/dsl/gunsmith/components/room/playwright/wire/saved-weapon/WithSavedWeapon";

const RIFLE = {identity: {key: "rifle", name: "Rifle"}, magazineSize: 12};
const MARKSMAN = {identity: {key: "marksman-rifle", name: "Marksman rifle"}, magazineSize: 5};
const SUBMACHINE = {identity: {key: "submachine-gun", name: "Submachine gun"}, magazineSize: 30};

it("puts the saved weapon, with its drawing, in the holder's first place on the reveal", () => {
  const reveal = withSavedWeapon(revealFrame(), "player");

  expect(JSON.parse(reveal)).toMatchObject({
    kind: "reveal",
    weapons: {
      own: [
        {
          kind: "saved",
          weapon: {identity: {key: "saved", name: "Mint Coil"}},
          appearance: {palette: {accent: "weapon-mint"}},
        },
        {kind: "builtIn", key: "marksman-rifle"},
      ],
      opponent: [
        {kind: "builtIn", key: "rifle"},
        {kind: "builtIn", key: "marksman-rifle"},
      ],
    },
  });
});

it("puts it on the opponent's side of the reveal for the other browser", () => {
  const {weapons} = JSON.parse(withSavedWeapon(revealFrame(), "opponent"));

  expect(weapons.own[0]).toEqual({kind: "builtIn", key: "rifle"});
  expect(weapons.opponent[0].kind).toBe("saved");
});

it("still writes the reveal so it is known as one", () => {
  expect(withSavedWeapon(revealFrame(), "player").startsWith('{"kind":"reveal"')).toBe(true);
});

it("names the holder's first rifle in a snapshot as the saved weapon and keeps its numbers", () => {
  const snapshot = JSON.parse(withSavedWeapon(snapshotFrame(RIFLE), "player"));

  expect(snapshot.player.loadout[0].weapon).toEqual({identity: {key: "saved", name: "Mint Coil"}, magazineSize: 12});
  expect(snapshot.player.loadout[1].weapon).toEqual(MARKSMAN);
  expect(snapshot.opponent.loadout[0].weapon).toEqual(RIFLE);
});

it("names the opponent's first rifle for the other browser", () => {
  const snapshot = JSON.parse(withSavedWeapon(snapshotFrame(RIFLE), "opponent"));

  expect(snapshot.opponent.loadout[0].weapon.identity).toEqual({key: "saved", name: "Mint Coil"});
  expect(snapshot.player.loadout[0].weapon).toEqual(RIFLE);
});

it("leaves a first slot that holds a weapon picked up", () => {
  const frame = snapshotFrame(SUBMACHINE);

  expect(withSavedWeapon(frame, "player")).toBe(frame);
});

it("leaves a snapshot without the opponent in it", () => {
  const frame = JSON.stringify({kind: "snapshot", player: {loadout: [{weapon: RIFLE}]}});

  expect(withSavedWeapon(frame, "opponent")).toBe(frame);
});

it("hands on any other frame unchanged", () => {
  const frame = JSON.stringify({kind: "joined", seat: "first"});

  expect(withSavedWeapon(frame, "player")).toBe(frame);
});

function revealFrame(): string {
  return JSON.stringify({
    kind: "reveal",
    arena: {name: "Duel"},
    weapons: {
      own: [
        {kind: "builtIn", key: "rifle"},
        {kind: "builtIn", key: "marksman-rifle"},
      ],
      opponent: [
        {kind: "builtIn", key: "rifle"},
        {kind: "builtIn", key: "marksman-rifle"},
      ],
    },
  });
}

function snapshotFrame(first: object): string {
  return JSON.stringify({
    kind: "snapshot",
    player: {loadout: [{weapon: first}, {weapon: MARKSMAN}]},
    opponent: {loadout: [{weapon: RIFLE}, {weapon: MARKSMAN}]},
  });
}
