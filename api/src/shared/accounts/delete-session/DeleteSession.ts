import {database} from "@src/shared/accounts/Database";
import {sessions} from "@src/shared/accounts/schema/Sessions";
import {eq} from "drizzle-orm";

/** Ends one session, if it exists. */
export async function deleteSession(idHash: string): Promise<void> {
  await database().delete(sessions).where(eq(sessions.idHash, idHash));
}
