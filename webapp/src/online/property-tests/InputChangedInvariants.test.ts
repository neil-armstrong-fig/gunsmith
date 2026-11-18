import fc from "fast-check";
import type {Input} from "@gunsmith/engine/game-loop/types/Input";
import {inputChanged} from "@src/online/prediction/changes/InputChanged";
import {asks} from "@src/online/property-tests/arbitraries/Asks";

/**
 * What must hold for any two asks, not only the ones someone wrote down. `InputChanged.test.ts` says what counts as a change in particular
 * cases; this puts random asks through it. When a property fails, fast-check shrinks the case and prints a seed to replay it.
 *
 * Deliberately outside `pnpm checks`: a fresh seed each run means a failure is not reproducible from the same commit
 * (`vitest.config.ts`). Run it with `pnpm test:properties`; `PROPERTY_TEST_RUNS` sets how many cases each property gets.
 */
const RUNS = Number(process.env["PROPERTY_TEST_RUNS"] ?? 100);

it("sends an ask again only when it differs, and always when it differs in what the player walks, stands or holds", () => {
  fc.assert(fc.property(asks(), asks(), expectAChangeOnlyWhenItDiffers), {numRuns: RUNS});
});

function expectAChangeOnlyWhenItDiffers(before: Input, after: Input): void {
  expect(inputChanged(before, before)).toBe(false);

  const walkChanged =
    before.direction.x !== after.direction.x ||
    before.direction.y !== after.direction.y ||
    before.firing !== after.firing ||
    Boolean(before.crouching) !== Boolean(after.crouching);
  if (walkChanged) {
    expect(inputChanged(before, after)).toBe(true);
  }
}
