import {DUEL_BUILT_IN_ARENA} from "@gunsmith/engine/built-in-arenas/DuelBuiltInArena";
import {FAIR_DUEL_BUILT_IN_ARENA} from "@gunsmith/engine/built-in-arenas/FairDuelBuiltInArena";
import {PreRound} from "@src/durable-objects/match/pre-round/PreRound";

const DUEL = DUEL_BUILT_IN_ARENA.name;
const FAIR_DUEL = FAIR_DUEL_BUILT_IN_ARENA.name;

it("decides on the duel arena when both seats lock in having chosen nothing", () => {
  const preRound = new PreRound(60, () => 1);

  preRound.lockIn("first");
  preRound.lockIn("second");

  expect(preRound.outcome()).toEqual({arena: DUEL_BUILT_IN_ARENA, how: "same"});
});

it("decides on the arena both seats put forward without asking either to pick", () => {
  const preRound = new PreRound(60, () => 1);

  choose(preRound, "first", FAIR_DUEL);
  choose(preRound, "second", FAIR_DUEL);

  expect(preRound.outcome()).toEqual({arena: FAIR_DUEL_BUILT_IN_ARENA, how: "same"});
});

it("offers both arenas to be picked from once both are locked in and they differ", () => {
  const preRound = new PreRound(60, () => 1);

  choose(preRound, "first", DUEL);
  choose(preRound, "second", FAIR_DUEL);

  expect(preRound.outcome()).toBeUndefined();
  expect(preRound.viewOf("first")).toMatchObject({stage: "picking", own: {arena: DUEL}, opponent: {arena: FAIR_DUEL}});
  expect(preRound.viewOf("second")).toMatchObject({stage: "picking", own: {arena: FAIR_DUEL}, opponent: {arena: DUEL}});
});

it("plays the arena a seat picks when the other picks nothing", () => {
  const preRound = new PreRound(60, () => 1);
  choose(preRound, "first", DUEL);
  choose(preRound, "second", FAIR_DUEL);

  preRound.pickArena("first", {kind: "arena", seat: "second"});
  preRound.pickArena("second", {kind: "nothing"});

  expect(preRound.outcome()).toEqual({arena: FAIR_DUEL_BUILT_IN_ARENA, how: "only-pick"});
});

it("plays the arena both seats picked", () => {
  const preRound = new PreRound(60, () => 1);
  choose(preRound, "first", DUEL);
  choose(preRound, "second", FAIR_DUEL);

  preRound.pickArena("first", {kind: "arena", seat: "first"});
  preRound.pickArena("second", {kind: "arena", seat: "first"});

  expect(preRound.outcome()).toEqual({arena: DUEL_BUILT_IN_ARENA, how: "agreed"});
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
  preRound.chooseArena("second", FAIR_DUEL);
  preRound.lockIn("second");

  const before = preRound.viewOf("first");
  preRound.lockIn("first");
  const after = preRound.viewOf("first");

  expect(before.opponent).toEqual({locked: true, picked: false});
  expect(after.opponent.arena).toBe(FAIR_DUEL);
});

it("tells a seat only whether the other has locked in, not what they chose, while it is choosing", () => {
  const preRound = new PreRound(60, () => 1);

  preRound.chooseArena("second", FAIR_DUEL);
  const drafting = preRound.viewOf("first");
  preRound.lockIn("second");
  const locked = preRound.viewOf("first");

  expect(JSON.stringify(drafting)).not.toContain(FAIR_DUEL);
  expect(JSON.stringify(locked)).not.toContain(FAIR_DUEL);
  expect(drafting.opponent.locked).toBe(false);
  expect(locked.opponent.locked).toBe(true);
});

it("ignores an arena that is not a built-in one", () => {
  const preRound = new PreRound(60, () => 1);

  preRound.chooseArena("first", "no-such-arena");

  expect(preRound.viewOf("first").own.arena).toBeUndefined();
});

it("keeps a locked-in arena: it cannot be changed", () => {
  const preRound = new PreRound(60, () => 1);
  choose(preRound, "first", FAIR_DUEL);
  preRound.chooseArena("first", DUEL);

  expect(preRound.viewOf("first").own.arena).toBe(FAIR_DUEL);
});

it("ignores a pick before both arenas are shown and one after it has decided", () => {
  const preRound = new PreRound(60, () => 1);
  preRound.pickArena("first", {kind: "arena", seat: "second"});
  choose(preRound, "first", DUEL);
  choose(preRound, "second", DUEL);
  preRound.pickArena("first", {kind: "arena", seat: "second"});

  expect(preRound.outcome()).toEqual({arena: DUEL_BUILT_IN_ARENA, how: "same"});
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
  preRound.chooseArena("second", FAIR_DUEL);
  preRound.startClock();

  preRound.tick(60);

  expect(preRound.viewOf("second").own).toMatchObject({locked: true, arena: DUEL});
  expect(preRound.outcome()?.how).toBe("random");
});

it("keeps a seat's first pick: it cannot be changed", () => {
  const preRound = new PreRound(60, () => 1);
  choose(preRound, "first", DUEL);
  choose(preRound, "second", FAIR_DUEL);

  preRound.pickArena("first", {kind: "arena", seat: "second"});
  preRound.pickArena("first", {kind: "arena", seat: "first"});
  preRound.pickArena("second", {kind: "nothing"});

  expect(preRound.outcome()).toEqual({arena: FAIR_DUEL_BUILT_IN_ARENA, how: "only-pick"});
});

it("counts a pick not made when the time runs out as picking nothing", () => {
  const preRound = new PreRound(60, () => 1);
  choose(preRound, "first", DUEL);
  choose(preRound, "second", FAIR_DUEL);
  preRound.pickArena("second", {kind: "arena", seat: "second"});
  preRound.startClock();

  preRound.tick(60);

  expect(preRound.outcome()).toEqual({arena: FAIR_DUEL_BUILT_IN_ARENA, how: "only-pick"});
});

it("decides at once on the defaults when it is allowed no time", () => {
  const preRound = new PreRound(0, () => 1);

  preRound.startClock();

  expect(preRound.outcome()).toEqual({arena: DUEL_BUILT_IN_ARENA, how: "same"});
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
  preRound.chooseArena("second", DUEL);

  preRound.release("first");

  expect(preRound.viewOf("first").own).toEqual({locked: false});
  expect(preRound.viewOf("second").own).toEqual({arena: DUEL, locked: false});
});

function choose(preRound: PreRound, seat: "first" | "second", arena: string): void {
  preRound.chooseArena(seat, arena);
  preRound.lockIn(seat);
}
