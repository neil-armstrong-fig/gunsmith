import {test as base} from "@playwright/test";
import type {AcceptanceTestFixtures} from "@src/acceptance-criteria-mapping/fixtures/types/AcceptanceTestFixtures";
import {GunsmithDsl} from "@src/dsl/gunsmith/GunsmithDsl";

/** Playwright's `test`, extended so each spec is handed the game, opened and ready. Handing the browser to the DSL happens here and nowhere else. */
export const test = base.extend<AcceptanceTestFixtures>({
  gunsmith: async ({page}, use) => {
    const gunsmith = new GunsmithDsl(page);

    await gunsmith.begin();
    await use(gunsmith);
  },
});
