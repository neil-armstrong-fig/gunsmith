import {listShelf} from "@src/router/routes/library/list-shelf/ListShelf";
import {removeFromShelf} from "@src/router/routes/library/remove/RemoveFromShelf";
import {saveToShelf} from "@src/router/routes/library/save/SaveToShelf";
import {keepAndSaveItem} from "@src/router/routes/library/testing/KeepAndSaveItem";
import type {ShelfAnswer} from "@src/router/routes/library/types/ShelfAnswer";
import {keepItem} from "@src/router/routes/library/testing/KeepItem";

const SAVED = new Date("2026-11-19T12:00:00Z");

it("takes an item off the shelf and frees its place", async () => {
  await keepAndSaveItem({accountId: "acct-1", id: "arena-1", kind: "arena", savedAt: SAVED});

  const response = await removeFromShelf("acct-1", "arena-1");

  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({status: "removed"});
  expect(await arenaIds("acct-1")).toEqual([]);
});

it("keeps the item, so it can be put back on the shelf by its id", async () => {
  await keepAndSaveItem({accountId: "acct-1", id: "arena-1", kind: "arena", savedAt: SAVED});
  await removeFromShelf("acct-1", "arena-1");

  const response = await saveToShelf(
    "acct-1",
    new Request("https://gunsmith.test/api/library", {method: "POST", body: '{"id":"arena-1"}'}),
  );

  expect(response.status).toBe(200);
  expect(await arenaIds("acct-1")).toEqual(["arena-1"]);
});

it("answers 200 for a kept item that was never saved", async () => {
  await keepItem("acct-1", "arena-1", "arena");

  expect((await removeFromShelf("acct-1", "arena-1")).status).toBe(200);
});

it("answers 404 for an id nobody kept, and leaves another account's item on its shelf", async () => {
  await keepAndSaveItem({accountId: "acct-2", id: "arena-theirs", kind: "arena", savedAt: SAVED});

  const nobody = await removeFromShelf("acct-1", "arena-nobody");
  const theirs = await removeFromShelf("acct-1", "arena-theirs");

  expect(nobody.status).toBe(404);
  expect(await nobody.json()).toEqual({error: "not-found"});
  expect(theirs.status).toBe(404);
  expect(await arenaIds("acct-2")).toEqual(["arena-theirs"]);
});

async function arenaIds(accountId: string): Promise<string[]> {
  const answer = (await (await listShelf(accountId)).json()) as ShelfAnswer;

  return answer.arenas.map(item => item.id);
}
