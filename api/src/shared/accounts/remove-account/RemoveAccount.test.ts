import type {AccountRemoval} from "@src/shared/accounts/types/AccountRemoval";
import {removeAccount} from "@src/shared/accounts/remove-account/RemoveAccount";
import {rowsOf} from "@src/shared/accounts/testing/local-database/RowsOf";
import {useLocalDatabase} from "@src/shared/accounts/testing/local-database/UseLocalDatabase";

vi.unmock("@src/shared/accounts/remove-account/RemoveAccount");

const REMOVAL: AccountRemoval = {
  subjectDigest: async googleSub => `digest-of-${googleSub}`,
  keepUntil: new Date("2027-02-17T12:00:00Z"),
};

const emptyDatabase = useLocalDatabase();

it("removes the account and its sessions, leaving another account's alone", async () => {
  const database = await emptyDatabase();
  await insertAccountWithSession(database, "acct-1", "hash-1");
  await insertAccountWithSession(database, "acct-2", "hash-2");

  await removeAccount("acct-1", REMOVAL);

  expect(await rowsOf(database, "SELECT id FROM users")).toEqual([{id: "acct-2"}]);
  expect(await rowsOf(database, "SELECT id_hash FROM sessions")).toEqual([{id_hash: "hash-2"}]);
});

it("lets the same Google subject make a new account afterwards", async () => {
  const database = await emptyDatabase();
  await insertAccountWithSession(database, "acct-1", "hash-1");

  await removeAccount("acct-1", REMOVAL);

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

  await expect(removeAccount("acct-nobody", REMOVAL)).resolves.toBeUndefined();
  expect(await rowsOf(database, "SELECT id FROM users")).toEqual([{id: "acct-1"}]);
});

it("keeps the digest of the subject, the credit id and the time to forget them, and nothing else about the person", async () => {
  const database = await emptyDatabase();
  await insertAccountWithSession(database, "acct-1", "hash-1");

  await removeAccount("acct-1", REMOVAL);

  expect(await rowsOf(database, "SELECT * FROM deleted_accounts")).toEqual([
    {subject_digest: "digest-of-sub-acct-1", credit_account_id: "acct-1", keep_until: 1802865600},
  ]);
});

it("keeps nothing for an account it does not hold", async () => {
  const database = await emptyDatabase();
  await insertAccountWithSession(database, "acct-1", "hash-1");

  await removeAccount("acct-nobody", REMOVAL);

  expect(await rowsOf(database, "SELECT * FROM deleted_accounts")).toEqual([]);
});

it("removes nothing when the digest cannot be made, so the account is not lost without its record", async () => {
  const database = await emptyDatabase();
  await insertAccountWithSession(database, "acct-1", "hash-1");

  await expect(
    removeAccount("acct-1", {...REMOVAL, subjectDigest: () => Promise.reject(new TypeError("no key"))}),
  ).rejects.toThrow("no key");

  expect(await rowsOf(database, "SELECT id FROM users")).toEqual([{id: "acct-1"}]);
});

it("replaces a record already held for the same digest", async () => {
  const database = await emptyDatabase();
  await insertAccountWithSession(database, "acct-1", "hash-1");
  await database
    .prepare(
      "INSERT INTO deleted_accounts (subject_digest, credit_account_id, keep_until) VALUES ('digest-of-sub-acct-1', 'acct-0', 1)",
    )
    .run();

  await removeAccount("acct-1", REMOVAL);

  expect(await rowsOf(database, "SELECT credit_account_id FROM deleted_accounts")).toEqual([
    {credit_account_id: "acct-1"},
  ]);
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
