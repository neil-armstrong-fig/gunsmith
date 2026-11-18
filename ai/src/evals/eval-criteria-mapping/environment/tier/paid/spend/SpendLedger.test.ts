import {mkdtempSync, writeFileSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {SpendLedger} from "@evals/eval-criteria-mapping/environment/tier/paid/spend/SpendLedger";

it("starts at nothing spent when there is no file yet", () => {
  expect(new SpendLedger({file: ledgerFile(), ceilingDollars: 1}).total()).toBe(0);
});

it("keeps what is added, across ledgers on the same file, because the ceiling is for every run in total", () => {
  const file = ledgerFile();
  new SpendLedger({file, ceilingDollars: 1}).add(0.25);
  new SpendLedger({file, ceilingDollars: 1}).add(0.5);

  expect(new SpendLedger({file, ceilingDollars: 1}).total()).toBeCloseTo(0.75, 10);
});

it("has room while the total is under the ceiling", () => {
  const ledger = new SpendLedger({file: ledgerFile(), ceilingDollars: 1});
  ledger.add(0.99);

  expect(() => ledger.assertRoom()).not.toThrow();
});

it("refuses once the total reaches the ceiling, naming both", () => {
  const ledger = new SpendLedger({file: ledgerFile(), ceilingDollars: 1});
  ledger.add(1);

  expect(() => ledger.assertRoom()).toThrow("$1.0000 of the $1.00 ceiling");
});

it("refuses to guess when the file is not a ledger, rather than start again from nothing", () => {
  const file = ledgerFile();
  writeFileSync(file, "not json");

  expect(() => new SpendLedger({file, ceilingDollars: 1}).total()).toThrow("ledger");
});

function ledgerFile(): string {
  return join(mkdtempSync(join(tmpdir(), "ledger-")), "ledger.json");
}
