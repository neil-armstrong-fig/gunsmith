import {keepGeneratedItem} from "@src/shared/accounts/keep-generated-item/KeepGeneratedItem";
import {saveItem} from "@src/shared/accounts/save-item/SaveItem";
import {savedItemsOfAccount} from "@src/shared/accounts/saved-items-of-account/SavedItemsOfAccount";
import {insertUser} from "@src/shared/accounts/testing/local-database/InsertUser";
import {useLocalDatabase} from "@src/shared/accounts/testing/local-database/UseLocalDatabase";

vi.unmock("@src/shared/accounts/keep-generated-item/KeepGeneratedItem");
vi.unmock("@src/shared/accounts/save-item/SaveItem");
vi.unmock("@src/shared/accounts/saved-items-of-account/SavedItemsOfAccount");

const NOW = new Date("2026-11-19T12:00:00Z");
const LIMITS = {weapons: 5, arenas: 5};
const emptyDatabase = useLocalDatabase();

it("reads the stored result back as the value that was kept, with its kind, prompt and saved time", async () => {
  const database = await emptyDatabase();
  await insertUser(database, "acct-1");
  await keepGeneratedItem({
    id: "arena-1",
    userId: "acct-1",
    kind: "arena",
    prompt: "a maze",
    payload: {arena: {rows: ["##", "#."]}},
    now: NOW,
  });
  await saveItem({id: "arena-1", userId: "acct-1", now: NOW, limits: LIMITS});

  expect(await savedItemsOfAccount("acct-1")).toEqual([
    {id: "arena-1", kind: "arena", prompt: "a maze", payload: {arena: {rows: ["##", "#."]}}, savedAt: NOW},
  ]);
});

it("leaves out kept items that were never saved", async () => {
  const database = await emptyDatabase();
  await insertUser(database, "acct-1");
  await keepGeneratedItem({id: "weapon-1", userId: "acct-1", kind: "weapon", prompt: "p", payload: {}, now: NOW});

  expect(await savedItemsOfAccount("acct-1")).toEqual([]);
});

it("puts items saved in the same second in order of their ids", async () => {
  const database = await emptyDatabase();
  await insertUser(database, "acct-1");
  for (const id of ["weapon-c", "weapon-a", "weapon-b"]) {
    await keepGeneratedItem({id, userId: "acct-1", kind: "weapon", prompt: "p", payload: {}, now: NOW});
    await saveItem({id, userId: "acct-1", now: NOW, limits: LIMITS});
  }

  expect((await savedItemsOfAccount("acct-1")).map(item => item.id)).toEqual(["weapon-a", "weapon-b", "weapon-c"]);
});
