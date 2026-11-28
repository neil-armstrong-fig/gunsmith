import {keepGeneratedItem} from "@src/shared/accounts/keep-generated-item/KeepGeneratedItem";
import {saveItem} from "@src/shared/accounts/save-item/SaveItem";
import {insertUser} from "@src/shared/accounts/testing/local-database/InsertUser";
import {rowsOf} from "@src/shared/accounts/testing/local-database/RowsOf";
import {useLocalDatabase} from "@src/shared/accounts/testing/local-database/UseLocalDatabase";
import {unsaveItem} from "@src/shared/accounts/unsave-item/UnsaveItem";

vi.unmock("@src/shared/accounts/keep-generated-item/KeepGeneratedItem");
vi.unmock("@src/shared/accounts/save-item/SaveItem");
vi.unmock("@src/shared/accounts/unsave-item/UnsaveItem");

const NOW = new Date("2026-11-19T12:00:00Z");
const LIMITS = {weapons: 5, arenas: 5};
const emptyDatabase = useLocalDatabase();

it("empties the saved time but keeps the row and its result, so the id still works", async () => {
  const database = await emptyDatabase();
  await insertUser(database, "acct-1");
  await keepAndSave("weapon-1", "acct-1");

  const found = await unsaveItem("acct-1", "weapon-1");

  expect(found).toBe(true);
  expect(await rowsOf(database, "SELECT id, payload, saved_at FROM generated_items")).toEqual([
    {id: "weapon-1", payload: '{"name":"weapon-1"}', saved_at: null},
  ]);
});

it("touches only the item named", async () => {
  const database = await emptyDatabase();
  await insertUser(database, "acct-1");
  await keepAndSave("weapon-1", "acct-1");
  await keepAndSave("weapon-2", "acct-1");

  await unsaveItem("acct-1", "weapon-1");

  expect(await rowsOf(database, "SELECT id, saved_at FROM generated_items ORDER BY id")).toEqual([
    {id: "weapon-1", saved_at: null},
    {id: "weapon-2", saved_at: NOW.getTime() / 1000},
  ]);
});

it("does not find another account's item and leaves it saved", async () => {
  const database = await emptyDatabase();
  await insertUser(database, "acct-1");
  await insertUser(database, "acct-2");
  await keepAndSave("weapon-1", "acct-2");

  const found = await unsaveItem("acct-1", "weapon-1");

  expect(found).toBe(false);
  expect(await rowsOf(database, "SELECT saved_at FROM generated_items")).toEqual([{saved_at: NOW.getTime() / 1000}]);
});

async function keepAndSave(id: string, userId: string): Promise<void> {
  await keepGeneratedItem({id, userId, kind: "weapon", prompt: "p", payload: {name: id}, now: NOW});
  await saveItem({id, userId, now: NOW, limits: LIMITS});
}
