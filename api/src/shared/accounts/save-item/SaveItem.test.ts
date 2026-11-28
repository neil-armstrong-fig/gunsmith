import {keepGeneratedItem} from "@src/shared/accounts/keep-generated-item/KeepGeneratedItem";
import {saveItem} from "@src/shared/accounts/save-item/SaveItem";
import {insertUser} from "@src/shared/accounts/testing/local-database/InsertUser";
import {rowsOf} from "@src/shared/accounts/testing/local-database/RowsOf";
import {useLocalDatabase} from "@src/shared/accounts/testing/local-database/UseLocalDatabase";
import type {ItemKind} from "@src/shared/accounts/types/ItemKind";

vi.unmock("@src/shared/accounts/keep-generated-item/KeepGeneratedItem");
vi.unmock("@src/shared/accounts/save-item/SaveItem");

const NOW = new Date("2026-11-19T12:00:00Z");
const LATER = new Date("2026-11-20T12:00:00Z");
const LIMITS = {weapons: 1, arenas: 0};
const ROOM_FOR_MORE = {weapons: 5, arenas: 5};
const emptyDatabase = useLocalDatabase();

it("stamps the item with the second it was saved and touches no other row", async () => {
  const database = await emptyDatabase();
  await insertUser(database, "acct-1");
  await keep("weapon-1", "acct-1", "weapon");
  await keep("arena-1", "acct-1", "arena");

  await saveItem({id: "weapon-1", userId: "acct-1", now: NOW, limits: LIMITS});

  expect(await rowsOf(database, "SELECT id, saved_at FROM generated_items ORDER BY id")).toEqual([
    {id: "arena-1", saved_at: null},
    {id: "weapon-1", saved_at: NOW.getTime() / 1000},
  ]);
});

it("keeps the first time when the item is saved again", async () => {
  const database = await emptyDatabase();
  await insertUser(database, "acct-1");
  await keep("weapon-1", "acct-1", "weapon");
  await saveItem({id: "weapon-1", userId: "acct-1", now: NOW, limits: ROOM_FOR_MORE});

  await saveItem({id: "weapon-1", userId: "acct-1", now: LATER, limits: ROOM_FOR_MORE});

  expect(await rowsOf(database, "SELECT saved_at FROM generated_items")).toEqual([{saved_at: NOW.getTime() / 1000}]);
});

it("leaves another account's item unsaved, even with the right id", async () => {
  const database = await emptyDatabase();
  await insertUser(database, "acct-1");
  await insertUser(database, "acct-2");
  await keep("weapon-1", "acct-2", "weapon");

  const result = await saveItem({id: "weapon-1", userId: "acct-1", now: NOW, limits: LIMITS});

  expect(result).toEqual({status: "not-found"});
  expect(await rowsOf(database, "SELECT saved_at FROM generated_items")).toEqual([{saved_at: null}]);
});

it("counts only this account's saved items of the same kind against the limit", async () => {
  const database = await emptyDatabase();
  await insertUser(database, "acct-1");
  await insertUser(database, "acct-2");
  await keep("weapon-theirs", "acct-2", "weapon");
  await saveItem({id: "weapon-theirs", userId: "acct-2", now: NOW, limits: LIMITS});
  await keep("weapon-mine", "acct-1", "weapon");

  const result = await saveItem({id: "weapon-mine", userId: "acct-1", now: NOW, limits: LIMITS});

  expect(result).toEqual({status: "saved"});
});

it("refuses every save of a kind whose limit is zero, leaving the row unsaved", async () => {
  const database = await emptyDatabase();
  await insertUser(database, "acct-1");
  await keep("arena-1", "acct-1", "arena");

  const result = await saveItem({id: "arena-1", userId: "acct-1", now: NOW, limits: LIMITS});

  expect(result).toEqual({status: "full", kind: "arena", limit: 0});
  expect(await rowsOf(database, "SELECT saved_at FROM generated_items")).toEqual([{saved_at: null}]);
});

async function keep(id: string, userId: string, kind: ItemKind): Promise<void> {
  await keepGeneratedItem({id, userId, kind, prompt: "p", payload: {}, now: NOW});
}
