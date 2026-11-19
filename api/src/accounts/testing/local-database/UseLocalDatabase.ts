import type {DatabaseBinding} from "@src/accounts/testing/local-database/types/DatabaseBinding";
import {workerEnvironment} from "@src/env/WorkerEnvironment";
import {readdirSync, readFileSync} from "node:fs";
import {resolve} from "node:path";
import {getPlatformProxy} from "wrangler";
import type {PlatformProxy} from "wrangler";

const MIGRATIONS = resolve(import.meta.dirname, "../../../../migrations");

/**
 * For a test of the real account functions: starts wrangler's local D1 once for the test file (in plain node, nothing on disk) with
 * the migrations applied, and answers a function that gives each test an **empty** database, set as `workerEnvironment.DB`. Call it
 * at the top level of the test file, which must `vi.unmock` the functions it tests (`SetupApiTests` gives every file the in-memory ones).
 */
export function useLocalDatabase(): () => Promise<D1Database> {
  let platform: PlatformProxy<DatabaseBinding> | undefined;

  beforeAll(async () => {
    platform = await getPlatformProxy<DatabaseBinding>({persist: false});
    await applyMigrations(platform.env.DB);
  }, 60_000);

  afterAll(async () => {
    await platform?.dispose();
  });

  return async () => {
    const database = platform?.env.DB;
    if (!database) {
      throw new Error("the local D1 did not start");
    }
    await database.prepare("DELETE FROM sessions").run();
    await database.prepare("DELETE FROM users").run();
    workerEnvironment.DB = database;

    return database;
  };
}

/** What Wrangler does for `migrations apply`: each file in order, each statement on its own (D1 runs one at a time). */
async function applyMigrations(database: D1Database): Promise<void> {
  const files = readdirSync(MIGRATIONS)
    .filter(name => name.endsWith(".sql"))
    .sort();
  for (const file of files) {
    for (const statement of readFileSync(resolve(MIGRATIONS, file), "utf8").split("--> statement-breakpoint")) {
      await database.prepare(statement.trim()).run();
    }
  }
}
