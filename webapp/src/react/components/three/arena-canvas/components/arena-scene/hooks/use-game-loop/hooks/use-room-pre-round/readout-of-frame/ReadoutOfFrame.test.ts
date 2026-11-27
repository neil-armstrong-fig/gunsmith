import {RIFLE} from "@gunsmith/engine/weapon/weapons/Rifle";
import {fallbackAppearance} from "@gunsmith/shared/appearance/fallback/FallbackAppearance";
import type {Appearance} from "@gunsmith/shared/appearance/schema/Appearance";
import {weaponAppearances} from "@src/assets/weapon-drawings/appearances/WeaponAppearances";
import type {PreRoundFrame} from "@src/online/types/pre-round/PreRoundFrame";
import {readoutOfFrame} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/hooks/use-room-pre-round/readout-of-frame/ReadoutOfFrame";
import type {ReadoutRequest} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/hooks/use-room-pre-round/readout-of-frame/types/ReadoutRequest";
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
    builtInArenas: ["Duel", "Keep", "Slalom", "Pinwheel", "Catwalk"],
    how: undefined,
    reveal: undefined,
    own: seatOf({}),
    opponent: seatOf({}),
  });
});

it("offers the built-in arenas the room offers, in the room's order", () => {
  const frame: PreRoundFrame = {...alone, builtInArenas: ["Watchtower", "Hourglass", "Keep", "Duel", "Slalom"]};

  expect(readoutOfFrame({frame, reveal: undefined}).builtInArenas).toEqual([
    "Watchtower",
    "Hourglass",
    "Keep",
    "Duel",
    "Slalom",
  ]);
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

it("shows the other player's saved weapon with the numbers the server told once, drawn with the drawing it came with", () => {
  const appearance = mintAppearance();

  const shown = readoutOfFrame(toldSaved("Sparky", appearance)).opponent.slots[0].shown;

  expect(shown).toEqual({kind: "saved", name: "Sparky", weapon: {...RIFLE, identity: {key: "saved", name: "Sparky"}}});
  expect(shown?.kind === "saved" && shown.weapon && weaponAppearances.get(shown.weapon)).toEqual(appearance);
});

it("draws the other player's saved weapon with the stand-in when the schema refuses its drawing", () => {
  const refused = {version: 99} as unknown as Appearance;

  const shown = readoutOfFrame(toldSaved("Sparky", refused)).opponent.slots[0].shown;

  expect(shown?.kind === "saved" && shown.weapon && weaponAppearances.get(shown.weapon)).toEqual(fallbackAppearance());
});

it("shows a saved weapon by name alone while the server has not told its numbers", () => {
  const shown = readoutOfFrame({frame: opponentNaming("Sparky"), reveal: undefined}).opponent.slots[0].shown;

  expect(shown).toEqual({kind: "saved", name: "Sparky"});
});

it("keeps the weapon it showed while the server shows the same one, so its drawing is not made again each second", () => {
  const first = readoutOfFrame(toldSaved("Sparky", mintAppearance()));

  const next = readoutOfFrame({
    ...toldSaved("Sparky", mintAppearance()),
    frame: {...opponentNaming("Sparky"), secondsLeft: 41},
    previous: first,
  });

  expect(next.opponent.slots[0].shown).toBe(first.opponent.slots[0].shown);
});

it("shows a new weapon when the server shows a different one, or its numbers arrive after its name", () => {
  const sparky = readoutOfFrame(toldSaved("Sparky", mintAppearance()));
  const nameOnly = readoutOfFrame({frame: opponentNaming("Sparky"), reveal: undefined});

  const boomer = readoutOfFrame({...toldSaved("Boomer", mintAppearance()), previous: sparky});
  const numbered = readoutOfFrame({...toldSaved("Sparky", mintAppearance()), previous: nameOnly});

  expect(boomer.opponent.slots[0].shown).toMatchObject({name: "Boomer"});
  expect(numbered.opponent.slots[0].shown).toMatchObject({name: "Sparky", weapon: {bulletDamage: RIFLE.bulletDamage}});
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

/** The server's word that the other player's first weapon is their saved weapon `name`, and the one-time frame with the rifle's numbers and `appearance`. */
function toldSaved(name: string, appearance: Appearance): ReadoutRequest {
  const weapon = {...RIFLE, identity: {key: "saved", name}};

  return {
    frame: opponentNaming(name),
    reveal: undefined,
    opponentWeapons: [{kind: "opponentWeapon", slot: 1, weapon, appearance}, undefined],
  };
}

/** A frame in which the other player's first weapon is their saved weapon `name`, named alone as the server names it every frame. */
function opponentNaming(name: string): PreRoundFrame {
  return {
    ...alone,
    opponent: {
      ...alone.opponent,
      weapons: {slots: [{locked: true, choice: {kind: "saved", name}}, {locked: false}]},
    },
  };
}

function mintAppearance(): Appearance {
  const appearance = fallbackAppearance();

  return {...appearance, palette: {...appearance.palette, accent: "weapon-mint"}};
}
