import {database} from "@src/accounts/Database";
import {sessions} from "@src/accounts/schema/Sessions";
import {eq} from "drizzle-orm";

/** Ends one session, if it exists. */
export async function deleteSession(idHash: string): Promise<void> {
  await database().delete(sessions).where(eq(sessions.idHash, idHash));
}
