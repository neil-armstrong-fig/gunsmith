import {findOrCreateAccount} from "@src/shared/accounts/find-or-create-account/FindOrCreateAccount";
import {rowsOf} from "@src/shared/accounts/testing/local-database/RowsOf";
import {useLocalDatabase} from "@src/shared/accounts/testing/local-database/UseLocalDatabase";

vi.unmock("@src/shared/accounts/find-or-create-account/FindOrCreateAccount");

const NOW = new Date("2026-11-19T12:00:00Z");
const emptyDatabase = useLocalDatabase();

it("stores a new account for a Google subject it has not seen, and answers it", async () => {
  const database = await emptyDatabase();

  const account = await findOrCreateAccount("sub-1", {id: "acct-1", displayName: "Quiet Falcon", now: NOW});

  expect(account).toEqual({id: "acct-1", displayName: "Quiet Falcon"});
  expect(await rowsOf(database, "SELECT id, google_sub, display_name, created_at FROM users")).toEqual([
    {id: "acct-1", google_sub: "sub-1", display_name: "Quiet Falcon", created_at: NOW.getTime() / 1000},
  ]);
});

it("keeps the first id and name when the subject is already there, storing nothing more", async () => {
  const database = await emptyDatabase();
  await findOrCreateAccount("sub-1", {id: "acct-1", displayName: "Quiet Falcon", now: NOW});

  const again = await findOrCreateAccount("sub-1", {id: "acct-2", displayName: "Loud Heron", now: NOW});

  expect(again).toEqual({id: "acct-1", displayName: "Quiet Falcon"});
  expect(await rowsOf(database, "SELECT id FROM users")).toEqual([{id: "acct-1"}]);
});

it("stores one account per subject", async () => {
  const database = await emptyDatabase();

  await findOrCreateAccount("sub-1", {id: "acct-1", displayName: "Quiet Falcon", now: NOW});
  await findOrCreateAccount("sub-2", {id: "acct-2", displayName: "Loud Heron", now: NOW});

  expect(await rowsOf(database, "SELECT id FROM users ORDER BY id")).toEqual([{id: "acct-1"}, {id: "acct-2"}]);
});

it("makes one account when the same subject first signs in twice at once", async () => {
  const database = await emptyDatabase();

  const [first, second] = await Promise.all([
    findOrCreateAccount("sub-1", {id: "acct-1", displayName: "Quiet Falcon", now: NOW}),
    findOrCreateAccount("sub-1", {id: "acct-2", displayName: "Loud Heron", now: NOW}),
  ]);

  expect(second).toEqual(first);
  expect(await rowsOf(database, "SELECT id FROM users")).toHaveLength(1);
});
