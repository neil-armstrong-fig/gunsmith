import {DUEL_BUILT_IN_ARENA} from "@gunsmith/engine/arena/built-in/DuelBuiltInArena";
import {resolveArenaChoice} from "@src/durable-objects/match/choices/ResolveArenaChoice";
import {keepItemFor} from "@src/durable-objects/match/choices/saved-item/testing/KeepItemFor";
import {saveItemFor} from "@src/durable-objects/match/choices/saved-item/testing/SaveItemFor";

it("takes a built-in arena by name, for a guest and for a signed-in player alike", async () => {
  expect(await resolveArenaChoice(undefined, {kind: "builtIn", name: "Duel"})).toEqual({kind: "builtIn", name: "Duel"});
  expect(await resolveArenaChoice("acct-1", {kind: "builtIn", name: "Duel"})).toEqual({kind: "builtIn", name: "Duel"});
});

it("refuses a saved arena for a guest: a guest has no library", async () => {
  expect(await resolveArenaChoice(undefined, {kind: "saved", id: "arena-1"})).toBeUndefined();
});

it("takes the signed-in player's own saved arena, with its id, name and drawing", async () => {
  await saveItemFor({
    accountId: "acct-1",
    id: "arena-1",
    kind: "arena",
    payload: {arena: {name: "My yard", rows: DUEL_BUILT_IN_ARENA.rows}},
  });

  expect(await resolveArenaChoice("acct-1", {kind: "saved", id: "arena-1"})).toEqual({
    kind: "saved",
    id: "arena-1",
    arena: {name: "My yard", rows: DUEL_BUILT_IN_ARENA.rows},
  });
});

it("refuses another account's saved arena", async () => {
  await saveItemFor({accountId: "acct-2", id: "arena-1", kind: "arena", payload: {arena: DUEL_BUILT_IN_ARENA}});

  expect(await resolveArenaChoice("acct-1", {kind: "saved", id: "arena-1"})).toBeUndefined();
});

it("refuses an arena the account kept but never saved", async () => {
  await keepItemFor({accountId: "acct-1", id: "arena-1", kind: "arena", payload: {arena: DUEL_BUILT_IN_ARENA}});

  expect(await resolveArenaChoice("acct-1", {kind: "saved", id: "arena-1"})).toBeUndefined();
});

it("refuses an id the account does not have", async () => {
  expect(await resolveArenaChoice("acct-1", {kind: "saved", id: "arena-1"})).toBeUndefined();
});

it("refuses the id of a saved weapon", async () => {
  await saveItemFor({accountId: "acct-1", id: "weapon-1", kind: "weapon", payload: {arena: DUEL_BUILT_IN_ARENA}});

  expect(await resolveArenaChoice("acct-1", {kind: "saved", id: "weapon-1"})).toBeUndefined();
});

it("refuses a saved arena the engine would not play, or whose payload is not an arena at all", async () => {
  await saveItemFor({
    accountId: "acct-1",
    id: "short",
    kind: "arena",
    payload: {arena: {name: "Short", rows: ["####", "#..#"]}},
  });
  await saveItemFor({accountId: "acct-1", id: "empty", kind: "arena", payload: {}});
  await saveItemFor({accountId: "acct-1", id: "text", kind: "arena", payload: "not an object"});
  await saveItemFor({accountId: "acct-1", id: "null", kind: "arena", payload: null});

  expect(await resolveArenaChoice("acct-1", {kind: "saved", id: "short"})).toBeUndefined();
  expect(await resolveArenaChoice("acct-1", {kind: "saved", id: "empty"})).toBeUndefined();
  expect(await resolveArenaChoice("acct-1", {kind: "saved", id: "text"})).toBeUndefined();
  expect(await resolveArenaChoice("acct-1", {kind: "saved", id: "null"})).toBeUndefined();
});
