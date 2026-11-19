import {database} from "@src/accounts/Database";
import {users} from "@src/accounts/schema/Users";
import {eq} from "drizzle-orm";

/** Removes the account; its sessions go with it by `ON DELETE cascade`. */
export async function removeAccount(userId: string): Promise<void> {
  await database().delete(users).where(eq(users.id, userId));
}
