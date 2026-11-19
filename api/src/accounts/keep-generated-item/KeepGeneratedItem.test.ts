import {keepGeneratedItem} from "@src/accounts/keep-generated-item/KeepGeneratedItem";
import {insertUser} from "@src/accounts/testing/local-database/InsertUser";
import {rowsOf} from "@src/accounts/testing/local-database/RowsOf";
import {useLocalDatabase} from "@src/accounts/testing/local-database/UseLocalDatabase";

vi.unmock("@src/accounts/keep-generated-item/KeepGeneratedItem");

const NOW = new Date("2026-11-19T12:00:00Z");
const emptyDatabase = useLocalDatabase();

it("keeps the item off the shelf with its kind, prompt, result as JSON and the second it was made", async () => {
  const database = await emptyDatabase();
  await insertUser(database, "acct-1");

  await keepGeneratedItem({
    id: "item-1",
    userId: "acct-1",
    kind: "arena",
    prompt: "a maze",
    payload: {rows: ["##"]},
    now: NOW,
  });

  expect(
    await rowsOf(database, "SELECT id, user_id, kind, prompt, payload, created_at, saved_at FROM generated_items"),
  ).toEqual([
    {
      id: "item-1",
      user_id: "acct-1",
      kind: "arena",
      prompt: "a maze",
      payload: '{"rows":["##"]}',
      created_at: NOW.getTime() / 1000,
      saved_at: null,
    },
  ]);
});

it("refuses an item for an account that does not exist, and a second with the same id", async () => {
  const database = await emptyDatabase();
  await insertUser(database, "acct-1");

  await expect(
    keepGeneratedItem({id: "item-1", userId: "acct-nobody", kind: "weapon", prompt: "p", payload: {}, now: NOW}),
  ).rejects.toThrow();
  await keepGeneratedItem({id: "item-2", userId: "acct-1", kind: "weapon", prompt: "p", payload: {}, now: NOW});
  await expect(
    keepGeneratedItem({id: "item-2", userId: "acct-1", kind: "weapon", prompt: "q", payload: {}, now: NOW}),
  ).rejects.toThrow();
  expect(await rowsOf(database, "SELECT id, prompt FROM generated_items")).toEqual([{id: "item-2", prompt: "p"}]);
});
