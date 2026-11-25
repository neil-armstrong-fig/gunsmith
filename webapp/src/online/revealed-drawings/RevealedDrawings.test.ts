import {BUILT_IN_WEAPONS} from "@gunsmith/engine/built-in-weapons/BuiltInWeapons";
import type {Player} from "@gunsmith/engine/player/types/Player";
import type {SeatView} from "@gunsmith/engine/seat/types/SeatView";
import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";
import {RIFLE} from "@gunsmith/engine/weapon/weapons/Rifle";
import {fallbackAppearance} from "@gunsmith/shared/appearance/fallback/FallbackAppearance";
import type {Appearance} from "@gunsmith/shared/appearance/schema/Appearance";
import {weaponAppearances} from "@src/assets/weapon-drawings/appearances/WeaponAppearances";
import {RevealedDrawings} from "@src/online/revealed-drawings/RevealedDrawings";
import type {RevealedWeapon} from "@src/online/types/RevealedWeapon";
import type {RevealFrame} from "@src/online/types/RevealFrame";
import {expect, it} from "vitest";

const SAVED: Weapon = {...RIFLE, identity: {key: "saved", name: "Mint Coil"}};
const THEIRS: Weapon = {...RIFLE, identity: {key: "saved", name: "Ember Lance"}, bulletDamage: 40};
const SUBMACHINE_GUN = builtIn("submachine-gun");
const MARKSMAN_RIFLE = builtIn("marksman-rifle");
const RIFLE_BY_KEY: RevealedWeapon = {kind: "builtIn", key: "rifle"};

it("gives each saved weapon the reveal names its drawing, for the reveal's cards", () => {
  const reveal = revealOf(savedAs(SAVED, mint()), savedAs(THEIRS, mint()));

  new RevealedDrawings(reveal);

  expect(weaponAppearances.get(weaponOf(reveal.weapons.own[0]))).toEqual(mint());
  expect(weaponAppearances.get(weaponOf(reveal.weapons.opponent[0]))).toEqual(mint());
});

it("draws an appearance the schema refuses as the stand-in", () => {
  const reveal = revealOf(savedAs(SAVED, {version: 99}), RIFLE_BY_KEY);

  new RevealedDrawings(reveal);

  expect(weaponAppearances.get(weaponOf(reveal.weapons.own[0]))).toEqual(fallbackAppearance());
});

it("gives this player's saved weapon in a snapshot the drawing the reveal gave it", () => {
  const reveal = revealOf(savedAs(SAVED, mint()), RIFLE_BY_KEY);
  const snapshot = viewOf([copyOf(SAVED), MARKSMAN_RIFLE]);

  new RevealedDrawings(reveal).noteOn(snapshot);

  expect(weaponAppearances.get(snapshot.player.loadout[0]?.weapon ?? RIFLE)).toBe(
    weaponAppearances.get(weaponOf(reveal.weapons.own[0])),
  );
});

it("gives the other fighter's saved weapon its drawing", () => {
  const reveal = revealOf(RIFLE_BY_KEY, savedAs(THEIRS, mint()));
  const snapshot = viewOf([RIFLE, MARKSMAN_RIFLE], [copyOf(THEIRS), MARKSMAN_RIFLE]);

  new RevealedDrawings(reveal).noteOn(snapshot);

  expect(weaponAppearances.get(snapshot.opponent?.loadout[0]?.weapon ?? RIFLE)).toEqual(mint());
});

it("gives every snapshot the same drawing, so it is made into a picture once", () => {
  const drawings = new RevealedDrawings(revealOf(savedAs(SAVED, mint()), RIFLE_BY_KEY));
  const first = viewOf([copyOf(SAVED), MARKSMAN_RIFLE]);
  const second = viewOf([copyOf(SAVED), MARKSMAN_RIFLE]);

  drawings.noteOn(first);
  drawings.noteOn(second);

  expect(weaponAppearances.get(second.player.loadout[0]?.weapon ?? RIFLE)).toBe(
    weaponAppearances.get(first.player.loadout[0]?.weapon ?? RIFLE),
  );
});

it("leaves a weapon picked up into the saved weapon's slot undrawn", () => {
  const snapshot = viewOf([copyOf(SUBMACHINE_GUN), MARKSMAN_RIFLE]);

  new RevealedDrawings(revealOf(savedAs(SAVED, mint()), RIFLE_BY_KEY)).noteOn(snapshot);

  expect(weaponAppearances.get(snapshot.player.loadout[0]?.weapon ?? RIFLE)).toBeUndefined();
});

it("leaves the other fighter's weapon of the same name undrawn when the reveal saved it for this player", () => {
  const snapshot = viewOf([RIFLE, MARKSMAN_RIFLE], [copyOf(SAVED), MARKSMAN_RIFLE]);

  new RevealedDrawings(revealOf(savedAs(SAVED, mint()), RIFLE_BY_KEY)).noteOn(snapshot);

  expect(weaponAppearances.get(snapshot.opponent?.loadout[0]?.weapon ?? RIFLE)).toBeUndefined();
});

it("leaves the saved weapon undrawn in a slot the reveal did not save it in", () => {
  const snapshot = viewOf([RIFLE, copyOf(SAVED)]);

  new RevealedDrawings(revealOf(savedAs(SAVED, mint()), RIFLE_BY_KEY)).noteOn(snapshot);

  expect(weaponAppearances.get(snapshot.player.loadout[1]?.weapon ?? RIFLE)).toBeUndefined();
});

function builtIn(key: string): Weapon {
  return BUILT_IN_WEAPONS.find(weapon => weapon.identity?.key === key) ?? RIFLE;
}

function mint(): Appearance {
  const appearance = fallbackAppearance();

  return {...appearance, palette: {...appearance.palette, accent: "weapon-mint"}};
}

function savedAs(weapon: Weapon, appearance: unknown): RevealedWeapon {
  return {kind: "saved", weapon: copyOf(weapon), appearance: appearanceOf(appearance)};
}

/** The frame's type says it is an appearance; a frame from the wire may still carry one the schema refuses. */
function appearanceOf(value: unknown): Appearance {
  return Object(value);
}

/** A weapon as a snapshot carries it: the same numbers in a new object, since every snapshot is new JSON. */
function copyOf(weapon: Weapon): Weapon {
  return structuredClone(weapon);
}

/** The reveal with `own` and `opponent` in slot 1 of each side, and the marksman rifle in each slot 2. */
function revealOf(own: RevealedWeapon, opponent: RevealedWeapon): RevealFrame {
  const secondSlot: RevealedWeapon = {kind: "builtIn", key: "marksman-rifle"};

  return {
    kind: "reveal",
    arena: {name: "Duel", rows: []},
    weapons: {own: [own, secondSlot], opponent: [opponent, secondSlot]},
  };
}

function weaponOf(revealed: RevealedWeapon): Weapon {
  if (revealed.kind === "saved") {
    return revealed.weapon;
  }

  return RIFLE;
}

/** A snapshot with this player carrying `player` and, when given, the other fighter in sight carrying `opponent`. */
function viewOf(player: readonly Weapon[], opponent?: readonly Weapon[]): SeatView {
  const view: SeatView = {player: fighterWith(player), bullets: [], round: "playing", elapsedSeconds: 1};
  if (opponent) {
    view.opponent = fighterWith(opponent);
  }

  return view;
}

function fighterWith(weapons: readonly Weapon[]): Player {
  return {
    position: {x: 1, y: 1},
    aim: {x: 1, y: 0},
    cooldownSeconds: 0,
    loadout: weapons.map(weapon => ({weapon, rounds: weapon.magazineSize, reserve: weapon.startingReserve})),
    equippedIndex: 0,
    crouching: false,
    health: 100,
  };
}
