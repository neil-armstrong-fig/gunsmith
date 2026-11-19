import {accountOfSession} from "@src/accounts/account-of-session/AccountOfSession";
import {useLocalDatabase} from "@src/accounts/testing/local-database/UseLocalDatabase";

vi.unmock("@src/accounts/account-of-session/AccountOfSession");

const NOW = new Date("2026-11-19T12:00:00Z");
const LATER = new Date("2026-11-20T12:00:00Z");
const emptyDatabase = useLocalDatabase();

it("answers the account a live session belongs to", async () => {
  const database = await emptyDatabase();
  await insertSession(database, {account: "acct-1", name: "Quiet Falcon", hash: "hash-1", expiresAt: LATER});

  expect(await accountOfSession("hash-1", NOW)).toEqual({id: "acct-1", displayName: "Quiet Falcon"});
});

it("answers the account of that session and not another account's", async () => {
  const database = await emptyDatabase();
  await insertSession(database, {account: "acct-1", name: "Quiet Falcon", hash: "hash-1", expiresAt: LATER});
  await insertSession(database, {account: "acct-2", name: "Loud Heron", hash: "hash-2", expiresAt: LATER});

  expect(await accountOfSession("hash-2", NOW)).toEqual({id: "acct-2", displayName: "Loud Heron"});
});

it("answers nobody for a hash it does not hold", async () => {
  const database = await emptyDatabase();
  await insertSession(database, {account: "acct-1", name: "Quiet Falcon", hash: "hash-1", expiresAt: LATER});

  expect(await accountOfSession("hash-other", NOW)).toBeUndefined();
});

it("answers nobody at the second the session expires, or after", async () => {
  const database = await emptyDatabase();
  await insertSession(database, {account: "acct-1", name: "Quiet Falcon", hash: "hash-1", expiresAt: LATER});

  expect(await accountOfSession("hash-1", new Date(LATER.getTime() - 1000))).toBeDefined();
  expect(await accountOfSession("hash-1", LATER)).toBeUndefined();
  expect(await accountOfSession("hash-1", new Date(LATER.getTime() + 1000))).toBeUndefined();
});

interface SessionRow {
  account: string;
  name: string;
  hash: string;
  expiresAt: Date;
}

async function insertSession(database: D1Database, {account, name, hash, expiresAt}: SessionRow): Promise<void> {
  await database
    .prepare("INSERT INTO users (id, google_sub, display_name, created_at) VALUES (?, ?, ?, 0)")
    .bind(account, `sub-${account}`, name)
    .run();
  await database
    .prepare("INSERT INTO sessions (id_hash, user_id, expires_at) VALUES (?, ?, ?)")
    .bind(hash, account, expiresAt.getTime() / 1000)
    .run();
}
