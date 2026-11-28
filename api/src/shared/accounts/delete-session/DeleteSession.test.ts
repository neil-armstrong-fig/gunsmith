import {deleteSession} from "@src/shared/accounts/delete-session/DeleteSession";
import {rowsOf} from "@src/shared/accounts/testing/local-database/RowsOf";
import {useLocalDatabase} from "@src/shared/accounts/testing/local-database/UseLocalDatabase";

vi.unmock("@src/shared/accounts/delete-session/DeleteSession");

const emptyDatabase = useLocalDatabase();

it("removes that session and only that one, leaving the account", async () => {
  const database = await emptyDatabase();
  await insertAccountWithSessions(database, ["hash-1", "hash-2"]);

  await deleteSession("hash-1");

  expect(await rowsOf(database, "SELECT id_hash FROM sessions")).toEqual([{id_hash: "hash-2"}]);
  expect(await rowsOf(database, "SELECT id FROM users")).toEqual([{id: "acct-1"}]);
});

it("does nothing for a session it does not hold", async () => {
  const database = await emptyDatabase();
  await insertAccountWithSessions(database, ["hash-1"]);

  await expect(deleteSession("hash-nobody")).resolves.toBeUndefined();
  expect(await rowsOf(database, "SELECT id_hash FROM sessions")).toEqual([{id_hash: "hash-1"}]);
});

async function insertAccountWithSessions(database: D1Database, hashes: string[]): Promise<void> {
  await database
    .prepare(
      "INSERT INTO users (id, google_sub, display_name, created_at) VALUES ('acct-1', 'sub-1', 'Quiet Falcon', 0)",
    )
    .run();
  for (const hash of hashes) {
    await database
      .prepare("INSERT INTO sessions (id_hash, user_id, expires_at) VALUES (?, 'acct-1', 4102444800)")
      .bind(hash)
      .run();
  }
}
