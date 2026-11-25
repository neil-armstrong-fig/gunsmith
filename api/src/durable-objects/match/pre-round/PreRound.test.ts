import {BUILT_IN_ARENAS} from "@gunsmith/engine/built-in-arenas/BuiltInArenas";
import {DUEL_BUILT_IN_ARENA} from "@gunsmith/engine/built-in-arenas/DuelBuiltInArena";
import {FAIR_DUEL_BUILT_IN_ARENA} from "@gunsmith/engine/built-in-arenas/FairDuelBuiltInArena";
import {MARKSMAN_RIFLE} from "@gunsmith/engine/weapon/weapons/MarksmanRifle";
import {RIFLE} from "@gunsmith/engine/weapon/weapons/Rifle";
import {SUBMACHINE_GUN} from "@gunsmith/engine/weapon/weapons/SubmachineGun";
import type {BuiltInArena} from "@gunsmith/engine/built-in-arenas/types/BuiltInArena";
import type {Seat} from "@gunsmith/engine/seat/types/Seat";
import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";
import {fallbackAppearance} from "@gunsmith/shared/appearance/fallback/FallbackAppearance";
import {PreRound} from "@src/durable-objects/match/pre-round/PreRound";
import type {ChosenArena} from "@src/durable-objects/match/pre-round/types/ChosenArena";
import type {ChosenWeapon} from "@src/durable-objects/match/pre-round/types/ChosenWeapon";
import type {ChosenWeapons} from "@src/durable-objects/match/pre-round/types/ChosenWeapons";

const DUEL = DUEL_BUILT_IN_ARENA.name;
const FAIR_DUEL = FAIR_DUEL_BUILT_IN_ARENA.name;
const DEFAULT_WEAPONS = {first: RIFLE, second: MARKSMAN_RIFLE};
const BUILT_IN_RIFLE = {kind: "builtIn", key: "rifle"};
const BUILT_IN_MARKSMAN_RIFLE = {kind: "builtIn", key: "marksman-rifle"};
const BUILT_IN_SUBMACHINE_GUN = {kind: "builtIn", key: "submachine-gun"};
const DAYS_ARENAS = ["Cover yard", "Pinwheel", "Slalom", "Keep", "Labyrinth"];

it("decides on the duel arena when both seats lock in having chosen nothing", () => {
  const preRound = new PreRound(60, () => 1);

  choose(preRound, "first", DUEL);
  choose(preRound, "second", DUEL);

  expect(preRound.outcome()).toEqual({
    arena: DUEL_BUILT_IN_ARENA,
    how: "same",
    weapons: {first: DEFAULT_WEAPONS, second: DEFAULT_WEAPONS},
    chosen: {
      first: [BUILT_IN_RIFLE, BUILT_IN_MARKSMAN_RIFLE],
      second: [BUILT_IN_RIFLE, BUILT_IN_MARKSMAN_RIFLE],
    },
  });
});

it("decides on the arena both seats put forward without asking either to pick", () => {
  const preRound = new PreRound(60, () => 1);

  choose(preRound, "first", FAIR_DUEL);
  choose(preRound, "second", FAIR_DUEL);

  expect(preRound.outcome()).toMatchObject({arena: FAIR_DUEL_BUILT_IN_ARENA, how: "same"});
});

it("offers both arenas to be picked from once both are locked in and they differ", () => {
  const preRound = new PreRound(60, () => 1);

  choose(preRound, "first", DUEL);
  choose(preRound, "second", FAIR_DUEL);

  expect(preRound.outcome()).toBeUndefined();
  expect(preRound.viewOf("first")).toMatchObject({
    stage: "picking",
    own: {arena: {kind: "builtIn", name: DUEL}},
    opponent: {arena: {kind: "builtIn", name: FAIR_DUEL}},
  });
  expect(preRound.viewOf("second")).toMatchObject({
    stage: "picking",
    own: {arena: {kind: "builtIn", name: FAIR_DUEL}},
    opponent: {arena: {kind: "builtIn", name: DUEL}},
  });
});

it("plays the arena a seat picks when the other picks nothing", () => {
  const preRound = new PreRound(60, () => 1);
  choose(preRound, "first", DUEL);
  choose(preRound, "second", FAIR_DUEL);

  preRound.pickArena("first", {kind: "arena", seat: "second"});
  preRound.pickArena("second", {kind: "nothing"});

  expect(preRound.outcome()).toMatchObject({arena: FAIR_DUEL_BUILT_IN_ARENA, how: "only-pick"});
});

it("plays the arena both seats picked", () => {
  const preRound = new PreRound(60, () => 1);
  choose(preRound, "first", DUEL);
  choose(preRound, "second", FAIR_DUEL);

  preRound.pickArena("first", {kind: "arena", seat: "first"});
  preRound.pickArena("second", {kind: "arena", seat: "first"});

  expect(preRound.outcome()).toMatchObject({arena: DUEL_BUILT_IN_ARENA, how: "agreed"});
});

it("settles two different picks with the seed it is given, the same way every time", () => {
  const outcomes = [5, 5, 6, 6].map(seed => {
    const preRound = new PreRound(60, () => seed);
    choose(preRound, "first", DUEL);
    choose(preRound, "second", FAIR_DUEL);
    preRound.pickArena("first", {kind: "arena", seat: "first"});
    preRound.pickArena("second", {kind: "arena", seat: "second"});

    return preRound.outcome();
  });

  expect(outcomes[0]).toEqual(outcomes[1]);
  expect(outcomes[2]).toEqual(outcomes[3]);
  expect(outcomes[0]?.how).toBe("coin");
});

it("does not show a seat the other's arena until both are locked in", () => {
  const preRound = new PreRound(60, () => 1);
  preRound.chooseArena("second", builtInArena(FAIR_DUEL));
  preRound.lockInArena("second");

  const before = preRound.viewOf("first");
  preRound.lockInArena("first");
  const after = preRound.viewOf("first");

  expect(before.opponent).toEqual({locked: true, picked: false, weapons: {locked: false}});
  expect(after.opponent.arena).toEqual({kind: "builtIn", name: FAIR_DUEL});
});

it("tells a seat only whether the other has locked in, not what they chose, while it is choosing", () => {
  const preRound = new PreRound(60, () => 1);

  preRound.chooseArena("second", builtInArena(FAIR_DUEL));
  const drafting = preRound.viewOf("first");
  preRound.lockInArena("second");
  const locked = preRound.viewOf("first");

  expect(JSON.stringify(drafting, withoutTheDaysArenas)).not.toContain(FAIR_DUEL);
  expect(JSON.stringify(locked, withoutTheDaysArenas)).not.toContain(FAIR_DUEL);
  expect(drafting.opponent.locked).toBe(false);
  expect(locked.opponent.locked).toBe(true);
});

it("ignores an arena that is not a built-in one", () => {
  const preRound = new PreRound(60, () => 1);

  preRound.chooseArena("first", builtInArena("no-such-arena"));

  expect(preRound.viewOf("first").own.arena).toBeUndefined();
});

it("keeps a locked-in arena: it cannot be changed", () => {
  const preRound = new PreRound(60, () => 1);
  choose(preRound, "first", FAIR_DUEL);
  preRound.chooseArena("first", builtInArena(DUEL));

  expect(preRound.viewOf("first").own.arena).toEqual({kind: "builtIn", name: FAIR_DUEL});
});

it("ignores a pick before both arenas are shown and one after it has decided", () => {
  const preRound = new PreRound(60, () => 1);
  preRound.pickArena("first", {kind: "arena", seat: "second"});
  choose(preRound, "first", DUEL);
  choose(preRound, "second", DUEL);
  preRound.pickArena("first", {kind: "arena", seat: "second"});

  expect(preRound.outcome()).toMatchObject({arena: DUEL_BUILT_IN_ARENA, how: "same"});
  expect(preRound.viewOf("first").own.pick).toBeUndefined();
});

it("lets a seat on its own choose and lock in with no limit of time", () => {
  const preRound = new PreRound(60, () => 1);
  choose(preRound, "first", FAIR_DUEL);

  preRound.tick(10_000);

  expect(preRound.outcome()).toBeUndefined();
  expect(preRound.viewOf("first")).toMatchObject({stage: "choosing", own: {locked: true}});
  expect(preRound.viewOf("first").secondsLeft).toBeUndefined();
});

it("counts the seconds down once both seats have sat", () => {
  const preRound = new PreRound(60, () => 1);
  preRound.startClock();

  preRound.tick(15);

  expect(preRound.viewOf("first").secondsLeft).toBe(45);
});

it("gives a seat that has not locked in the duel arena when the time runs out", () => {
  const preRound = new PreRound(60, () => 1);
  choose(preRound, "first", FAIR_DUEL);
  preRound.chooseArena("second", builtInArena(FAIR_DUEL));
  preRound.startClock();

  preRound.tick(60);

  expect(preRound.viewOf("second").own).toMatchObject({locked: true, arena: {kind: "builtIn", name: DUEL}});
  expect(preRound.outcome()?.how).toBe("random");
});

it("keeps a seat's first pick: it cannot be changed", () => {
  const preRound = new PreRound(60, () => 1);
  choose(preRound, "first", DUEL);
  choose(preRound, "second", FAIR_DUEL);

  preRound.pickArena("first", {kind: "arena", seat: "second"});
  preRound.pickArena("first", {kind: "arena", seat: "first"});
  preRound.pickArena("second", {kind: "nothing"});

  expect(preRound.outcome()).toMatchObject({arena: FAIR_DUEL_BUILT_IN_ARENA, how: "only-pick"});
});

it("counts a pick not made when the time runs out as picking nothing", () => {
  const preRound = new PreRound(60, () => 1);
  choose(preRound, "first", DUEL);
  choose(preRound, "second", FAIR_DUEL);
  preRound.pickArena("second", {kind: "arena", seat: "second"});
  preRound.startClock();

  preRound.tick(60);

  expect(preRound.outcome()).toMatchObject({arena: FAIR_DUEL_BUILT_IN_ARENA, how: "only-pick"});
});

it("decides at once on the defaults when it is allowed no time", () => {
  const preRound = new PreRound(0, () => 1);

  preRound.startClock();

  expect(preRound.outcome()).toMatchObject({arena: DUEL_BUILT_IN_ARENA, how: "same"});
});

it("stops counting once it has decided", () => {
  const preRound = new PreRound(60, () => 1);
  choose(preRound, "first", DUEL);
  choose(preRound, "second", DUEL);

  preRound.tick(1_000);

  expect(preRound.viewOf("first")).toMatchObject({stage: "decided", how: "same"});
});

it("forgets everything a seat chose when it is released, and nothing of the other's", () => {
  const preRound = new PreRound(60, () => 1);
  choose(preRound, "first", FAIR_DUEL);
  preRound.chooseArena("second", builtInArena(DUEL));

  preRound.release("first");

  expect(preRound.viewOf("first").own).toEqual({locked: false, weapons: {locked: false}});
  expect(preRound.viewOf("second").own).toEqual({
    arena: {kind: "builtIn", name: DUEL},
    locked: false,
    weapons: {locked: false},
  });
});

it("waits for both seats' weapons: a decided arena is not a decided pre-round", () => {
  const preRound = new PreRound(60, () => 1);

  preRound.lockInArena("first");
  preRound.lockInArena("second");

  expect(preRound.outcome()).toBeUndefined();
  expect(preRound.viewOf("first").stage).toBe("choosing");
});

it("plays the weapons each seat locked in, each in its own slot", () => {
  const preRound = new PreRound(60, () => 1);
  preRound.lockInArena("first");
  preRound.lockInArena("second");

  preRound.chooseWeapons("first", builtInWeapons("submachine-gun", "rifle"));
  preRound.lockInWeapons("first");
  preRound.lockInWeapons("second");

  expect(preRound.outcome()?.weapons).toEqual({first: {first: SUBMACHINE_GUN, second: RIFLE}, second: DEFAULT_WEAPONS});
});

it("lets a seat that chooses no weapons have the rifle and the marksman rifle", () => {
  const preRound = new PreRound(60, () => 1);

  preRound.lockInWeapons("first");

  expect(preRound.viewOf("first").own.weapons).toEqual({
    choices: [BUILT_IN_RIFLE, BUILT_IN_MARKSMAN_RIFLE],
    locked: true,
  });
});

it("ignores weapons that are not built in, and a pair with one that is not", () => {
  const preRound = new PreRound(60, () => 1);

  preRound.chooseWeapons("first", builtInWeapons("rifle", "no-such-weapon"));
  preRound.chooseWeapons("first", builtInWeapons("no-such-weapon", "rifle"));

  expect(preRound.viewOf("first").own.weapons).toEqual({locked: false});
});

it("keeps locked-in weapons: they cannot be changed", () => {
  const preRound = new PreRound(60, () => 1);
  preRound.chooseWeapons("first", builtInWeapons("submachine-gun", "submachine-gun"));
  preRound.lockInWeapons("first");

  preRound.chooseWeapons("first", builtInWeapons("rifle", "rifle"));

  expect(preRound.viewOf("first").own.weapons).toEqual({
    choices: [BUILT_IN_SUBMACHINE_GUN, BUILT_IN_SUBMACHINE_GUN],
    locked: true,
  });
});

it("shows a seat the other's weapons only once both seats have locked in their weapons", () => {
  const preRound = new PreRound(60, () => 1);
  preRound.chooseWeapons("second", builtInWeapons("submachine-gun", "rifle"));
  preRound.lockInWeapons("second");

  const before = preRound.viewOf("first");
  preRound.lockInWeapons("first");
  const after = preRound.viewOf("first");

  expect(before.opponent.weapons).toEqual({locked: true});
  expect(JSON.stringify(before)).not.toContain("submachine-gun");
  expect(after.opponent.weapons).toEqual({locked: true, choices: [BUILT_IN_SUBMACHINE_GUN, BUILT_IN_RIFLE]});
});

it("keeps a seat's weapons draft to itself", () => {
  const preRound = new PreRound(60, () => 1);

  preRound.chooseWeapons("second", builtInWeapons("submachine-gun", "rifle"));

  expect(JSON.stringify(preRound.viewOf("first"))).not.toContain("submachine-gun");
});

it("gives a seat that has not locked in its weapons the defaults when the time runs out, whatever it had in mind", () => {
  const preRound = new PreRound(60, () => 1);
  choose(preRound, "first", DUEL);
  preRound.chooseWeapons("second", builtInWeapons("submachine-gun", "submachine-gun"));
  preRound.lockInArena("second");
  preRound.startClock();

  preRound.tick(60);

  expect(preRound.viewOf("second").own.weapons).toEqual({
    choices: [BUILT_IN_RIFLE, BUILT_IN_MARKSMAN_RIFLE],
    locked: true,
  });
  expect(preRound.outcome()?.weapons.second).toEqual(DEFAULT_WEAPONS);
});

it("forgets the weapons a seat chose when it is released", () => {
  const preRound = new PreRound(60, () => 1);
  preRound.chooseWeapons("first", builtInWeapons("submachine-gun", "rifle"));
  preRound.lockInWeapons("first");

  preRound.release("first");

  expect(preRound.viewOf("first").own.weapons).toEqual({locked: false});
});

it("plays a saved arena a seat put forward when the other puts forward the same one, by id", () => {
  const preRound = new PreRound(60, () => 1);
  const arena = savedArena("arena-1", "Little room");

  chooseSaved(preRound, "first", arena);
  chooseSaved(preRound, "second", arena);

  expect(preRound.outcome()).toMatchObject({arena: roomNamed("Little room"), how: "same"});
});

it("treats two saved arenas with the same name as different arenas: it is the id that tells them apart", () => {
  const preRound = new PreRound(60, () => 1);

  chooseSaved(preRound, "first", savedArena("arena-1", "Little room"));
  chooseSaved(preRound, "second", savedArena("arena-2", "Little room"));

  expect(preRound.outcome()).toBeUndefined();
  expect(preRound.viewOf("first").stage).toBe("picking");
});

it("treats a saved arena called Duel as a different arena from the built-in Duel", () => {
  const preRound = new PreRound(60, () => 1);

  chooseSaved(preRound, "first", savedArena("arena-1", DUEL));
  choose(preRound, "second", DUEL);

  expect(preRound.viewOf("first").stage).toBe("picking");
});

it("plays the saved arena a seat picks, with its own drawing", () => {
  const preRound = new PreRound(60, () => 1);
  const arena = savedArena("arena-1", "Little room");
  chooseSaved(preRound, "first", arena);
  choose(preRound, "second", DUEL);

  preRound.pickArena("first", {kind: "arena", seat: "first"});
  preRound.pickArena("second", {kind: "arena", seat: "first"});

  expect(preRound.outcome()).toMatchObject({arena: roomNamed("Little room"), how: "agreed"});
});

it("tells a seat its own saved arena by name alone, and the other seat its name and drawing only once both are locked in", () => {
  const preRound = new PreRound(60, () => 1);
  const arena = savedArena("arena-1", "Little room");
  preRound.chooseArena("second", arena);
  preRound.lockInArena("second");

  const own = preRound.viewOf("second").own.arena;
  const before = preRound.viewOf("first").opponent.arena;
  preRound.lockInArena("first");
  const after = preRound.viewOf("first").opponent.arena;

  expect(own).toEqual({kind: "saved", name: "Little room"});
  expect(before).toBeUndefined();
  expect(after).toEqual({kind: "saved", name: "Little room", rows: roomNamed("Little room").rows});
});

it("never tells either seat the id of a saved arena or weapon", () => {
  const preRound = new PreRound(60, () => 1);
  chooseSaved(preRound, "first", savedArena("arena-secret-1", "Little room"));
  chooseSaved(preRound, "second", savedArena("arena-secret-2", "Big room"));
  preRound.chooseWeapons("first", [savedWeapon("weapon-secret-1", "Sparky"), savedWeapon("weapon-secret-2", "Zap")]);
  preRound.chooseWeapons("second", [savedWeapon("weapon-secret-3", "Boomer"), savedWeapon("weapon-secret-4", "Thud")]);
  preRound.lockInWeapons("first");
  preRound.lockInWeapons("second");

  for (const seat of ["first", "second"] as const) {
    expect(JSON.stringify(preRound.viewOf(seat))).not.toContain("secret");
  }
});

it("plays the saved weapons a seat locked in, each in its own slot, beside a built-in", () => {
  const preRound = new PreRound(60, () => 1);
  const sparky = savedWeapon("weapon-1", "Sparky");
  preRound.lockInArena("first");
  preRound.lockInArena("second");

  preRound.chooseWeapons("first", [sparky, {kind: "builtIn", key: "rifle"}]);
  preRound.lockInWeapons("first");
  preRound.lockInWeapons("second");

  expect(preRound.outcome()?.weapons.first).toEqual({first: weaponNamed("Sparky"), second: RIFLE});
  expect(preRound.outcome()?.chosen.first).toEqual([sparky, {kind: "builtIn", key: "rifle"}]);
});

it("tells a seat a saved weapon by its name, its own at once and the other's only once both have locked in", () => {
  const preRound = new PreRound(60, () => 1);
  preRound.chooseWeapons("second", [savedWeapon("weapon-1", "Sparky"), {kind: "builtIn", key: "rifle"}]);
  preRound.lockInWeapons("second");

  const own = preRound.viewOf("second").own.weapons;
  const before = preRound.viewOf("first").opponent.weapons;
  preRound.lockInWeapons("first");
  const after = preRound.viewOf("first").opponent.weapons;

  expect(own.choices).toEqual([{kind: "saved", name: "Sparky"}, BUILT_IN_RIFLE]);
  expect(before).toEqual({locked: true});
  expect(after.choices).toEqual([{kind: "saved", name: "Sparky"}, BUILT_IN_RIFLE]);
});

it("never sends a saved weapon's numbers or drawing in the pre-round view", () => {
  const preRound = new PreRound(60, () => 1);
  preRound.chooseWeapons("second", [savedWeapon("weapon-1", "Sparky"), savedWeapon("weapon-2", "Zap")]);
  preRound.lockInWeapons("second");
  preRound.lockInWeapons("first");

  const view = JSON.stringify(preRound.viewOf("first"));

  expect(view).not.toContain("bulletDamage");
  expect(view).not.toContain("palette");
});

/** The seat puts `arena` forward and locks in both steps: that arena, and the default weapons. */
it("offers every built-in arena until it is told the day's", () => {
  const preRound = new PreRound(60, () => 1);

  expect(preRound.viewOf("first").builtInArenas).toEqual(BUILT_IN_ARENAS.map(({name}) => name));
});

it("offers only the day's arenas once it is told them, to both seats", () => {
  const preRound = new PreRound(60, () => 1);

  preRound.offerArenas(DAYS_ARENAS);

  expect(preRound.viewOf("first").builtInArenas).toEqual(DAYS_ARENAS);
  expect(preRound.viewOf("second").builtInArenas).toEqual(DAYS_ARENAS);
});

it("ignores a built-in arena that is not one of the day's", () => {
  const preRound = new PreRound(60, () => 1);
  preRound.offerArenas(DAYS_ARENAS);

  preRound.chooseArena("first", builtInArena(DUEL));

  expect(preRound.viewOf("first").own.arena).toBeUndefined();
});

it("takes a built-in arena that is one of the day's", () => {
  const preRound = new PreRound(60, () => 1);
  preRound.offerArenas(DAYS_ARENAS);

  preRound.chooseArena("first", builtInArena("Slalom"));

  expect(preRound.viewOf("first").own.arena).toEqual({kind: "builtIn", name: "Slalom"});
});

it("takes a seat's own saved arena whatever the day's are", () => {
  const preRound = new PreRound(60, () => 1);
  preRound.offerArenas(DAYS_ARENAS);

  preRound.chooseArena("first", savedArena("arena-1", "Little room"));

  expect(preRound.viewOf("first").own.arena).toEqual({kind: "saved", name: "Little room"});
});

it("gives a seat that locks in having chosen nothing the first of the day's arenas", () => {
  const preRound = new PreRound(60, () => 1);
  preRound.offerArenas(DAYS_ARENAS);

  preRound.lockInArena("first");

  expect(preRound.viewOf("first").own.arena).toEqual({kind: "builtIn", name: "Cover yard"});
});

/** Leaves out the day's arenas, which name every arena either seat could choose, so a search of the rest finds what was chosen. */
function withoutTheDaysArenas(key: string, value: unknown): unknown {
  if (key === "builtInArenas") {
    return undefined;
  }

  return value;
}

function choose(preRound: PreRound, seat: Seat, arena: string): void {
  preRound.chooseArena(seat, builtInArena(arena));
  preRound.lockInArena(seat);
  preRound.lockInWeapons(seat);
}

function builtInArena(name: string): ChosenArena {
  return {kind: "builtIn", name};
}

function builtInWeapons(first: string, second: string): ChosenWeapons {
  return [
    {kind: "builtIn", key: first},
    {kind: "builtIn", key: second},
  ];
}

function chooseSaved(preRound: PreRound, seat: Seat, arena: ChosenArena): void {
  preRound.chooseArena(seat, arena);
  preRound.lockInArena(seat);
  preRound.lockInWeapons(seat);
}

function savedArena(id: string, name: string): ChosenArena {
  return {kind: "saved", id, arena: roomNamed(name)};
}

function roomNamed(name: string): BuiltInArena {
  return {name, rows: ["########", "#......#", "#......#", "#......#", "########"]};
}

function savedWeapon(id: string, name: string): ChosenWeapon {
  return {kind: "saved", id, weapon: weaponNamed(name), appearance: fallbackAppearance()};
}

function weaponNamed(name: string): Weapon {
  return {...SUBMACHINE_GUN, identity: {key: "saved", name}};
}
