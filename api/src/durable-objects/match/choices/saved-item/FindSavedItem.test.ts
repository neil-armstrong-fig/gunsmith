import {findSavedItem} from "@src/durable-objects/match/choices/saved-item/FindSavedItem";
import {keepItemFor} from "@src/durable-objects/match/choices/saved-item/testing/KeepItemFor";
import {saveItemFor} from "@src/durable-objects/match/choices/saved-item/testing/SaveItemFor";

it("finds an item the account saved, with its payload", async () => {
  await saveItemFor({accountId: "acct-1", id: "arena-1", kind: "arena", payload: {arena: {name: "Mine"}}});

  const item = await findSavedItem("acct-1", "arena-1", "arena");

  expect(item).toMatchObject({id: "arena-1", kind: "arena", payload: {arena: {name: "Mine"}}});
});

it("finds nothing for an id the account does not have", async () => {
  expect(await findSavedItem("acct-1", "arena-1", "arena")).toBeUndefined();
});

it("finds nothing for another account's saved item", async () => {
  await saveItemFor({accountId: "acct-2", id: "arena-1", kind: "arena", payload: {arena: {}}});

  expect(await findSavedItem("acct-1", "arena-1", "arena")).toBeUndefined();
});

it("finds nothing for an item the account kept but never saved", async () => {
  await keepItemFor({accountId: "acct-1", id: "arena-1", kind: "arena", payload: {arena: {}}});

  expect(await findSavedItem("acct-1", "arena-1", "arena")).toBeUndefined();
});

it("finds nothing when the id belongs to the other kind", async () => {
  await saveItemFor({accountId: "acct-1", id: "weapon-1", kind: "weapon", payload: {weapon: {}}});

  expect(await findSavedItem("acct-1", "weapon-1", "arena")).toBeUndefined();
});

it("finds the item asked for among several on the shelf", async () => {
  await saveItemFor({accountId: "acct-1", id: "arena-1", kind: "arena", payload: {arena: {name: "One"}}});
  await saveItemFor({accountId: "acct-1", id: "arena-2", kind: "arena", payload: {arena: {name: "Two"}}});

  expect(await findSavedItem("acct-1", "arena-2", "arena")).toMatchObject({id: "arena-2"});
});
