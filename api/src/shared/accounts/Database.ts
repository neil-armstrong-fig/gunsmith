import {workerEnvironment} from "@src/shared/env/WorkerEnvironment";
import {drizzle} from "drizzle-orm/d1";
import type {DrizzleD1Database} from "drizzle-orm/d1";

/** The Worker's D1 database, opened where it is used (not at import: the binding is read from the environment each time). */
export function database(): DrizzleD1Database {
  return drizzle(workerEnvironment.DB);
}
