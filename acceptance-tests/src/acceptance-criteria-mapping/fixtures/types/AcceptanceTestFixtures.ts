import type {GunsmithDsl} from "@src/dsl/gunsmith/GunsmithDsl";

/**
 * The DSL objects a spec can ask for. There is one, deliberately: `gunsmith` is the whole application, and every area
 * is reached through a member of it.
 */
export interface AcceptanceTestFixtures {
  gunsmith: GunsmithDsl;
}
