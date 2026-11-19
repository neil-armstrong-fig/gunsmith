import {SPAWN_SEED_SALT} from "@gunsmith/engine/arena-symmetry/spawn-pairs/SpawnSeedSalt";
import {PICKUP_SEED_SALT} from "@gunsmith/engine/pickup/placement/PickupSeedSalt";
import {RING_SEED_SALT} from "@gunsmith/engine/ring/centre/seed/RingSeedSalt";
import {resolveArenaPicks} from "@gunsmith/engine/arena-picking/ResolveArenaPicks";
import {ARENA_PICK_SEED_SALT} from "@gunsmith/engine/arena-picking/seed/ArenaPickSeedSalt";
import type {ArenaChoice} from "@gunsmith/engine/arena-picking/types/ArenaChoice";

// The rule draws from its own salted stream (`seed ^ ARENA_PICK_SEED_SALT`), one draw at a time as it needs them. The seeds below are
// named for what their first and second draws do (a draw under a half takes the first of two, a half or more the second):
// seed 0 draws 0.417 then 0.929, seed 3 draws 0.646 then 0.424, seed 5 draws 0.710 then 0.731.
const FIRST_DRAW_UNDER_A_HALF = 0; // the second draw, if one were taken, is a half or more: a rule that takes it wrongly is caught
const FIRST_DRAW_A_HALF_OR_MORE = 3; // and the second draw is under a half
const BOTH_DRAWS_A_HALF_OR_MORE = 5;

const FIRST_OWN: ArenaChoice = {kind: "arena", chosenPlayerId: "first"};
const SECOND_OWN: ArenaChoice = {kind: "arena", chosenPlayerId: "second"};
const RANDOM: ArenaChoice = {kind: "random"};
const NOTHING: ArenaChoice = {kind: "nothing"};

it("plays the arena both players picked, whichever it is, without any draw", () => {
  expect(resolved(SECOND_OWN, SECOND_OWN, FIRST_DRAW_UNDER_A_HALF)).toEqual({chosenPlayerId: "second", how: "agreed"});
  expect(resolved(FIRST_OWN, FIRST_OWN, FIRST_DRAW_A_HALF_OR_MORE)).toEqual({chosenPlayerId: "first", how: "agreed"});
});

it("settles two different picks by one coin: a draw under a half takes the first player's pick", () => {
  expect(resolved(FIRST_OWN, SECOND_OWN, FIRST_DRAW_UNDER_A_HALF)).toEqual({chosenPlayerId: "first", how: "coin"});
});

it("settles two different picks by one coin: a draw of a half or more takes the second player's pick", () => {
  expect(resolved(FIRST_OWN, SECOND_OWN, FIRST_DRAW_A_HALF_OR_MORE)).toEqual({chosenPlayerId: "second", how: "coin"});
});

it("plays the pick of the one player who picked, when the other picked nothing, whoever that is and whatever the seed", () => {
  expect(resolved(SECOND_OWN, NOTHING, FIRST_DRAW_UNDER_A_HALF)).toEqual({chosenPlayerId: "second", how: "only-pick"});
  expect(resolved(NOTHING, FIRST_OWN, FIRST_DRAW_A_HALF_OR_MORE)).toEqual({chosenPlayerId: "first", how: "only-pick"});
});

it("plays a player's own arena when they alone picked it, whichever player they are", () => {
  expect(resolved(FIRST_OWN, NOTHING, FIRST_DRAW_A_HALF_OR_MORE)).toEqual({chosenPlayerId: "first", how: "only-pick"});
  expect(resolved(NOTHING, SECOND_OWN, FIRST_DRAW_UNDER_A_HALF)).toEqual({chosenPlayerId: "second", how: "only-pick"});
});

// One player picked an arena and the other chose random: a first draw decides between the pick and random, and only if random wins
// does a second draw choose which of the two submitted arenas is played.
it("keeps the pick when the first draw is under a half, whoever chose random", () => {
  expect(resolved(FIRST_OWN, RANDOM, FIRST_DRAW_UNDER_A_HALF)).toEqual({chosenPlayerId: "first", how: "pick-kept"});
  expect(resolved(RANDOM, SECOND_OWN, FIRST_DRAW_UNDER_A_HALF)).toEqual({chosenPlayerId: "second", how: "pick-kept"});
});

it("keeps a pick of the other player's arena too, when the first draw is under a half", () => {
  expect(resolved(SECOND_OWN, RANDOM, FIRST_DRAW_UNDER_A_HALF)).toEqual({chosenPlayerId: "second", how: "pick-kept"});
});

it("lets random win when the first draw is a half or more, and a second draw under a half plays the first player's arena", () => {
  expect(resolved(FIRST_OWN, RANDOM, FIRST_DRAW_A_HALF_OR_MORE)).toEqual({chosenPlayerId: "first", how: "random"});
  expect(resolved(RANDOM, SECOND_OWN, FIRST_DRAW_A_HALF_OR_MORE)).toEqual({chosenPlayerId: "first", how: "random"});
});

it("lets random win when the first draw is a half or more, and a second draw of a half or more plays the second player's arena", () => {
  expect(resolved(FIRST_OWN, RANDOM, BOTH_DRAWS_A_HALF_OR_MORE)).toEqual({chosenPlayerId: "second", how: "random"});
  expect(resolved(RANDOM, SECOND_OWN, BOTH_DRAWS_A_HALF_OR_MORE)).toEqual({chosenPlayerId: "second", how: "random"});
});

// With no pick to set against it, random is one draw over the two submitted arenas: the first of the stream.
it("draws one arena from the two submitted when both chose random: a first draw under a half is the first player's", () => {
  expect(resolved(RANDOM, RANDOM, FIRST_DRAW_UNDER_A_HALF)).toEqual({chosenPlayerId: "first", how: "random"});
});

it("draws one arena from the two submitted when both chose random: a first draw of a half or more is the second player's", () => {
  expect(resolved(RANDOM, RANDOM, FIRST_DRAW_A_HALF_OR_MORE)).toEqual({chosenPlayerId: "second", how: "random"});
});

it("draws one arena from the two submitted when one chose random and the other picked nothing, as there is no pick to keep", () => {
  expect(resolved(RANDOM, NOTHING, FIRST_DRAW_A_HALF_OR_MORE)).toEqual({chosenPlayerId: "second", how: "random"});
  expect(resolved(NOTHING, RANDOM, FIRST_DRAW_UNDER_A_HALF)).toEqual({chosenPlayerId: "first", how: "random"});
});

it("draws one arena from the two submitted when nobody picked anything, since an arena has to be played", () => {
  expect(resolved(NOTHING, NOTHING, FIRST_DRAW_UNDER_A_HALF)).toEqual({chosenPlayerId: "first", how: "random"});
  expect(resolved(NOTHING, NOTHING, FIRST_DRAW_A_HALF_OR_MORE)).toEqual({chosenPlayerId: "second", how: "random"});
});

it("settles the same picks the same way for the same seed", () => {
  expect(resolved(FIRST_OWN, SECOND_OWN, 7)).toEqual(resolved(FIRST_OWN, SECOND_OWN, 7));
  expect(resolved(FIRST_OWN, RANDOM, 7)).toEqual(resolved(FIRST_OWN, RANDOM, 7));
  expect(resolved(RANDOM, NOTHING, 7)).toEqual(resolved(RANDOM, NOTHING, 7));
});

it("takes whoever is listed first as the first player, not whoever is called first", () => {
  const swapped = [
    {playerId: "second", choice: SECOND_OWN},
    {playerId: "first", choice: FIRST_OWN},
  ];

  expect(resolveArenaPicks({picks: swapped, seed: FIRST_DRAW_UNDER_A_HALF})).toEqual({
    chosenPlayerId: "second",
    how: "coin",
  });
});

it("refuses anything but two picks", () => {
  const picks = [{playerId: "first", choice: FIRST_OWN}];

  expect(() => resolveArenaPicks({picks, seed: 0})).toThrow("exactly two picks");
  expect(() => resolveArenaPicks({picks: [], seed: 0})).toThrow("exactly two picks");
});

it("refuses a third pick, though two players have picked", () => {
  const picks = [
    {playerId: "first", choice: FIRST_OWN},
    {playerId: "second", choice: SECOND_OWN},
    {playerId: "third", choice: NOTHING},
  ];

  expect(() => resolveArenaPicks({picks, seed: 0})).toThrow("but 3 were made");
});

it("refuses two picks from one player", () => {
  const picks = [
    {playerId: "first", choice: FIRST_OWN},
    {playerId: "first", choice: NOTHING},
  ];

  expect(() => resolveArenaPicks({picks, seed: 0})).toThrow("one pick for each player");
});

it("refuses a pick of an arena nobody submitted", () => {
  const picks = [
    {playerId: "first", choice: {kind: "arena" as const, chosenPlayerId: "third"}},
    {playerId: "second", choice: NOTHING},
  ];

  expect(() => resolveArenaPicks({picks, seed: 0})).toThrow("one of the two players");
});

// Seed 1 draws 0.222 salted (under a half, the first player) but 0.627 unsalted (a half or more, the second): the two streams differ.
it("draws from its own salted stream, not from the seed it is given, so it never shares a draw with another stream", () => {
  expect(resolved(FIRST_OWN, SECOND_OWN, 1)).toEqual({chosenPlayerId: "first", how: "coin"});
  expect(resolved(RANDOM, RANDOM, 1)).toEqual({chosenPlayerId: "first", how: "random"});
});

it("has a salt of its own, none of the engine's other streams' (pickup, ring and spawn)", () => {
  expect([PICKUP_SEED_SALT, RING_SEED_SALT, SPAWN_SEED_SALT]).not.toContain(ARENA_PICK_SEED_SALT);
});

function resolved(first: ArenaChoice, second: ArenaChoice, seed: number): ReturnType<typeof resolveArenaPicks> {
  return resolveArenaPicks({
    picks: [
      {playerId: "first", choice: first},
      {playerId: "second", choice: second},
    ],
    seed,
  });
}
