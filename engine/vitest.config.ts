import {vitestBaseConfig} from "@gunsmith/shared/config/vitest.base.js";
import {configDefaults, defineConfig} from "vitest/config";

/**
 * The property tests, which `pnpm test` (and so `pnpm checks`) deliberately leaves out.
 *
 * They draw hundreds of random inputs against a fresh seed each run, so unlike every other test here a failure is not
 * reproducible from the same commit: it means "these particular random inputs found something", which is worth
 * investigating but is not a reason to block a deploy. They run through `vitest.properties.config.ts`
 * (`pnpm test:properties`). Listed by path, so each new one is added here.
 */
export const PROPERTY_TESTS = [
  "src/weapon/balance/property-tests/BalanceWeaponInvariants.test.ts",
  "src/arena/validation/property-tests/ValidateArenaInvariants.test.ts",
  "src/arena/symmetry/property-tests/FairStartInvariants.test.ts",
  "src/arena/repair/property-tests/RepairArenaInvariants.test.ts",
  "src/library-items/property-tests/StoredItemInvariants.test.ts",
  "src/vision/sight/property-tests/ClearSightInvariants.test.ts",
];

export default defineConfig({
  ...vitestBaseConfig,
  test: {...vitestBaseConfig.test, exclude: [...configDefaults.exclude, ...PROPERTY_TESTS]},
});
