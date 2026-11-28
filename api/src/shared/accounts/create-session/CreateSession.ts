import {database} from "@src/shared/accounts/Database";
import {sessions} from "@src/shared/accounts/schema/Sessions";
import type {NewSession} from "@src/shared/accounts/types/NewSession";

/** Keeps a session: the hash of its token (never the token), whose it is and when it stops working. */
export async function createSession(session: NewSession): Promise<void> {
  await database().insert(sessions).values(session);
}
