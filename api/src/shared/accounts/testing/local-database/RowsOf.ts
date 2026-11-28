/** For a test: what a query on the local database answers, as plain rows. */
export async function rowsOf(database: D1Database, sql: string): Promise<Record<string, unknown>[]> {
  const answer = await database.prepare(sql).all<Record<string, unknown>>();

  return answer.results;
}
