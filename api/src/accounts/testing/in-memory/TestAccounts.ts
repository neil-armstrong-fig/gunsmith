import {InMemoryAccounts} from "@src/accounts/testing/in-memory/InMemoryAccounts";

/** The one in-memory set of accounts every test shares; `SetupApiTests` empties it before each test. */
export const testAccounts = new InMemoryAccounts();
