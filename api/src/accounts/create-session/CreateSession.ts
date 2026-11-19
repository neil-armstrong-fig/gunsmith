import {database} from "@src/accounts/Database";
import {sessions} from "@src/accounts/schema/Sessions";
import type {NewSession} from "@src/accounts/types/NewSession";

/** Keeps a session: the hash of its token (never the token), whose it is and when it stops working. */
export async function createSession(session: NewSession): Promise<void> {
  await database().insert(sessions).values(session);
}
