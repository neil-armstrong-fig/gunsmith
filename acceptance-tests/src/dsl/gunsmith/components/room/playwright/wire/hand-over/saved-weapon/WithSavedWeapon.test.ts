import {expect, it} from "vitest";
import {withSavedWeapon} from "@src/dsl/gunsmith/components/room/playwright/wire/hand-over/saved-weapon/WithSavedWeapon";

const RIFLE = {identity: {key: "rifle", name: "Rifle"}, magazineSize: 12};
const MARKSMAN = {identity: {key: "marksman-rifle", name: "Marksman rifle"}, magazineSize: 5};
const SUBMACHINE = {identity: {key: "submachine-gun", name: "Submachine gun"}, magazineSize: 30};

it("puts the saved weapon, with its drawing, in the holder's first place on the reveal", () => {
  const reveal = only(withSavedWeapon(revealFrame(), "player"));

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
  const {weapons} = JSON.parse(only(withSavedWeapon(revealFrame(), "opponent")));

  expect(weapons.own[0]).toEqual({kind: "builtIn", key: "rifle"});
  expect(weapons.opponent[0].kind).toBe("saved");
});

it("still writes the reveal so it is known as one", () => {
  expect(only(withSavedWeapon(revealFrame(), "player")).startsWith('{"kind":"reveal"')).toBe(true);
});

it("names the holder's first rifle in a snapshot as the saved weapon and keeps its numbers", () => {
  const snapshot = JSON.parse(only(withSavedWeapon(snapshotFrame(RIFLE), "player")));

  expect(snapshot.player.loadout[0].weapon).toEqual({identity: {key: "saved", name: "Mint Coil"}, magazineSize: 12});
  expect(snapshot.player.loadout[1].weapon).toEqual(MARKSMAN);
  expect(snapshot.opponent.loadout[0].weapon).toEqual(RIFLE);
});

it("names the opponent's first rifle for the other browser", () => {
  const snapshot = JSON.parse(only(withSavedWeapon(snapshotFrame(RIFLE), "opponent")));

  expect(snapshot.opponent.loadout[0].weapon.identity).toEqual({key: "saved", name: "Mint Coil"});
  expect(snapshot.player.loadout[0].weapon).toEqual(RIFLE);
});

it("leaves a first slot that holds a weapon picked up", () => {
  const frame = snapshotFrame(SUBMACHINE);

  expect(withSavedWeapon(frame, "player")).toEqual([frame]);
});

it("leaves a snapshot without the opponent in it", () => {
  const frame = JSON.stringify({kind: "snapshot", player: {loadout: [{weapon: RIFLE}]}});

  expect(withSavedWeapon(frame, "opponent")).toEqual([frame]);
});

it("names the holder's own first weapon in a choosing frame as the saved weapon, by name alone, as the server shows a seat its own", () => {
  const preRound = JSON.parse(only(withSavedWeapon(preRoundFrame(), "player")));

  expect(preRound.own.weapons.slots[0]).toEqual({locked: true, choice: {kind: "saved", name: "Mint Coil"}});
  expect(preRound.opponent.weapons.slots[0]).toEqual({locked: true, choice: {kind: "builtIn", key: "rifle"}});
});

it("names the holder's first weapon to the other browser too, and tells it the saved weapon's numbers and drawing in a frame of its own first", () => {
  const [told, choosing] = withSavedWeapon(preRoundFrame(), "opponent");

  expect(JSON.parse(told ?? "")).toMatchObject({
    kind: "opponentWeapon",
    slot: 1,
    weapon: {identity: {key: "saved", name: "Mint Coil"}, bulletDamage: 25},
    appearance: {palette: {accent: "weapon-mint"}},
  });
  expect(JSON.parse(choosing ?? "").opponent.weapons.slots[0].choice).toEqual({kind: "saved", name: "Mint Coil"});
  expect(choosing?.startsWith('{"kind":"preRound"')).toBe(true);
});

it("leaves a choosing frame whose first weapon is not shown yet", () => {
  const frame = JSON.stringify({
    kind: "preRound",
    own: {weapons: {slots: [{locked: false}, {locked: false}]}},
    opponent: {weapons: {slots: [{locked: true}, {locked: false}]}},
  });

  expect(withSavedWeapon(frame, "player")).toEqual([frame]);
  expect(withSavedWeapon(frame, "opponent")).toEqual([frame]);
});

it("hands on any other frame unchanged", () => {
  const frame = JSON.stringify({kind: "joined", seat: "first"});

  expect(withSavedWeapon(frame, "player")).toEqual([frame]);
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

function preRoundFrame(): string {
  const rifle = {locked: true, choice: {kind: "builtIn", key: "rifle"}};

  return JSON.stringify({
    kind: "preRound",
    stage: "choosing",
    own: {locked: false, weapons: {slots: [rifle, {locked: false}]}},
    opponent: {locked: false, picked: false, weapons: {slots: [rifle, {locked: false}]}},
  });
}

/** The one frame handed over for `frames`, which must be exactly one. */
function only(frames: readonly string[]): string {
  expect(frames).toHaveLength(1);

  return frames[0] ?? "";
}
