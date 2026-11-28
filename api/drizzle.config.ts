import {defineConfig} from "drizzle-kit";

// `drizzle-kit generate --name=<change>` writes the SQL in `migrations/`, which is read before it is kept. Wrangler applies it
// (`pnpm db:migrate:local`, `wrangler d1 migrations apply gunsmith --remote`): never `drizzle-kit migrate` or `push` against D1.
export default defineConfig({dialect: "sqlite", schema: "./src/shared/accounts/schema/*.ts", out: "./migrations"});
