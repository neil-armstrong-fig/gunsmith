import {D1Database} from "alchemy/cloudflare";
import {workspacePath} from "@src/paths/WorkspacePath";

export async function buildApiDatabase(): Promise<D1Database> {
  return D1Database("database", {
    name: "gunsmith",
    migrationsDir: workspacePath("api/migrations"),
    adopt: true,
    delete: false,
  });
}
