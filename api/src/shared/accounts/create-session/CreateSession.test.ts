import {createSession} from "@src/shared/accounts/create-session/CreateSession";
import {rowsOf} from "@src/shared/accounts/testing/local-database/RowsOf";
import {useLocalDatabase} from "@src/shared/accounts/testing/local-database/UseLocalDatabase";

vi.unmock("@src/shared/accounts/create-session/CreateSession");

const LATER = new Date("2026-11-20T12:00:00Z");
const emptyDatabase = useLocalDatabase();

it("stores the session's hash, whose it is and when it expires, to the second", async () => {
  const database = await emptyDatabase();
  await insertUser(database, "acct-1");

  await createSession({idHash: "hash-1", userId: "acct-1", expiresAt: LATER});

  expect(await rowsOf(database, "SELECT id_hash, user_id, expires_at FROM sessions")).toEqual([
    {id_hash: "hash-1", user_id: "acct-1", expires_at: LATER.getTime() / 1000},
  ]);
});

it("keeps several sessions for one account", async () => {
  const database = await emptyDatabase();
  await insertUser(database, "acct-1");

  await createSession({idHash: "hash-1", userId: "acct-1", expiresAt: LATER});
  await createSession({idHash: "hash-2", userId: "acct-1", expiresAt: LATER});

  expect(await rowsOf(database, "SELECT id_hash FROM sessions ORDER BY id_hash")).toEqual([
    {id_hash: "hash-1"},
    {id_hash: "hash-2"},
  ]);
});

it("refuses a session for an account that does not exist, and a second with the same hash", async () => {
  const database = await emptyDatabase();
  await insertUser(database, "acct-1");

  await expect(createSession({idHash: "hash-1", userId: "acct-nobody", expiresAt: LATER})).rejects.toThrow();
  await createSession({idHash: "hash-2", userId: "acct-1", expiresAt: LATER});
  await expect(createSession({idHash: "hash-2", userId: "acct-1", expiresAt: LATER})).rejects.toThrow();
  expect(await rowsOf(database, "SELECT id_hash FROM sessions")).toEqual([{id_hash: "hash-2"}]);
});

async function insertUser(database: D1Database, id: string): Promise<void> {
  await database
    .prepare("INSERT INTO users (id, google_sub, display_name, created_at) VALUES (?, ?, ?, 0)")
    .bind(id, `sub-${id}`, "Quiet Falcon")
    .run();
}
