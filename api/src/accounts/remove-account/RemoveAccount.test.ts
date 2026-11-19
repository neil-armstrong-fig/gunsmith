import {removeAccount} from "@src/accounts/remove-account/RemoveAccount";
import {rowsOf} from "@src/accounts/testing/local-database/RowsOf";
import {useLocalDatabase} from "@src/accounts/testing/local-database/UseLocalDatabase";

vi.unmock("@src/accounts/remove-account/RemoveAccount");

const emptyDatabase = useLocalDatabase();

it("removes the account and its sessions, leaving another account's alone", async () => {
  const database = await emptyDatabase();
  await insertAccountWithSession(database, "acct-1", "hash-1");
  await insertAccountWithSession(database, "acct-2", "hash-2");

  await removeAccount("acct-1");

  expect(await rowsOf(database, "SELECT id FROM users")).toEqual([{id: "acct-2"}]);
  expect(await rowsOf(database, "SELECT id_hash FROM sessions")).toEqual([{id_hash: "hash-2"}]);
});

it("lets the same Google subject make a new account afterwards", async () => {
  const database = await emptyDatabase();
  await insertAccountWithSession(database, "acct-1", "hash-1");

  await removeAccount("acct-1");

  await expect(
    database
      .prepare(
        "INSERT INTO users (id, google_sub, display_name, created_at) VALUES ('acct-9', 'sub-acct-1', 'Loud Heron', 0)",
      )
      .run(),
  ).resolves.toBeDefined();
});

it("does nothing for an account it does not hold", async () => {
  const database = await emptyDatabase();
  await insertAccountWithSession(database, "acct-1", "hash-1");

  await expect(removeAccount("acct-nobody")).resolves.toBeUndefined();
  expect(await rowsOf(database, "SELECT id FROM users")).toEqual([{id: "acct-1"}]);
});

async function insertAccountWithSession(database: D1Database, account: string, hash: string): Promise<void> {
  await database
    .prepare("INSERT INTO users (id, google_sub, display_name, created_at) VALUES (?, ?, 'Quiet Falcon', 0)")
    .bind(account, `sub-${account}`)
    .run();
  await database
    .prepare("INSERT INTO sessions (id_hash, user_id, expires_at) VALUES (?, ?, 4102444800)")
    .bind(hash, account)
    .run();
}
