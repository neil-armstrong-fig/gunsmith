import type {ApiWorkerEnvironment} from "@src/env/types/ApiWorkerEnvironment";
import {env} from "cloudflare:workers";

/**
 * The Worker's bindings and secrets, by import. **The only file that imports `cloudflare:workers`** (besides the two Durable Object
 * classes, which extend its `DurableObject`). Read a value where it is used, never copy it into a module-level constant: a test sets
 * and clears values on this object (`testing/SetupApiTests`), and a value copied at import would be the one from before.
 * The cast is because the runtime's `Env` is an empty interface until augmented.
 */
export const workerEnvironment = env as unknown as ApiWorkerEnvironment;
