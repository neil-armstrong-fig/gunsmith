import {test} from "@src/acceptance-criteria-mapping/fixtures/Test";
import type {AcceptanceTestFixtures} from "@src/acceptance-criteria-mapping/fixtures/types/AcceptanceTestFixtures";

type DefineSuite = () => void;

/** A criterion sees the DSL and nothing else: no `page`, `context`, `browser` or `testInfo`. */
type RunCriterion = (dsl: AcceptanceTestFixtures) => void | Promise<void>;

type PlaywrightTestBody = (fixtures: AcceptanceTestFixtures) => Promise<void>;

/** What one item of an `each` is called, as the name a reader sees in the report. */
type NameFor<Item> = (item: Item) => string;

/** The block an `each` repeats, handed the item it is being repeated for. */
type DefineSuiteFor<Item> = (item: Item) => void;

interface Suite {
  (criteria: string, define: DefineSuite): void;
  /** The same block once per item, for a criterion that holds for every member of a set. */
  each<Item>(items: readonly Item[], name: NameFor<Item>, define: DefineSuiteFor<Item>): void;
}

interface Criterion {
  (criteria: string, run: RunCriterion): void;
}

/**
 * `given` / `when` / `then` are thin wrappers over Playwright's `test.describe` / `test` that prefix the block name, so
 * a test run reads back as the acceptance criteria it was written from. `then` is the test itself, which is why it, and
 * only it, receives the DSL.
 */
export const given = suite("given");
export const when = suite("when");
export const then = criterion("then");

/** The arrangement a `given` or a `when` has just named, carried out before each criterion beneath it. */
export const beforeEach = arrangement();

export {expect} from "@playwright/test";

function suite(prefix: string): Suite {
  const wrapped = (criteria: string, define: DefineSuite): void => {
    test.describe(`${prefix} ${criteria}`, define);
  };
  wrapped.each = <Item>(items: readonly Item[], name: NameFor<Item>, define: DefineSuiteFor<Item>): void => {
    for (const item of items) {
      test.describe(`${prefix} ${name(item)}`, () => {
        define(item);
      });
    }
  };

  return wrapped;
}

function criterion(prefix: string): Criterion {
  return (criteria: string, run: RunCriterion): void => {
    test(`${prefix} ${criteria}`, withDslOnly(run));
  };
}

function arrangement(): (arrange: RunCriterion) => void {
  return (arrange: RunCriterion): void => {
    test.beforeEach(withDslOnly(arrange));
  };
}

/**
 * Rebuilds the argument object so a criterion receives only the DSL, whatever else Playwright passed in. The
 * destructuring is also how Playwright decides which fixtures to build, so a fixture added to
 * `AcceptanceTestFixtures` must be named here as well.
 */
function withDslOnly(run: RunCriterion): PlaywrightTestBody {
  return async ({gunsmith}: AcceptanceTestFixtures): Promise<void> => {
    await run({gunsmith});
  };
}
