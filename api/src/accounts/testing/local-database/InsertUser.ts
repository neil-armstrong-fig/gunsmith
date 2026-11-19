/** For a test of the real account functions: puts an account row in the database so an item or session can belong to it. */
export async function insertUser(database: D1Database, id: string): Promise<void> {
  await database
    .prepare("INSERT INTO users (id, google_sub, display_name, created_at) VALUES (?, ?, ?, 0)")
    .bind(id, `sub-${id}`, "Quiet Falcon")
    .run();
}
