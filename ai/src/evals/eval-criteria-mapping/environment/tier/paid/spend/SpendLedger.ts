import {mkdirSync, readFileSync, writeFileSync} from "node:fs";
import {dirname} from "node:path";
import type {SpendLedgerOptions} from "@evals/eval-criteria-mapping/environment/tier/paid/spend/types/SpendLedgerOptions";

/**
 * What the paid tier has spent in total, kept in a file so the ceiling holds across runs and not only inside one (`ai/AGENTS.md`:
 * the total ceiling is for every run together). A file that is not a ledger stops the run: guessing zero would let it spend again.
 */
export class SpendLedger {
  private readonly file: string;
  private readonly ceilingDollars: number;

  constructor(options: SpendLedgerOptions) {
    this.file = options.file;
    this.ceilingDollars = options.ceilingDollars;
  }

  total(): number {
    let text: string;
    try {
      text = readFileSync(this.file, "utf8");
    } catch {
      return 0;
    }

    return this.dollarsIn(text);
  }

  add(dollars: number): void {
    mkdirSync(dirname(this.file), {recursive: true});
    writeFileSync(this.file, `${JSON.stringify({dollars: this.total() + dollars})}\n`);
  }

  /** Throws, in words, once the total has reached the ceiling. */
  assertRoom(): void {
    const total = this.total();
    if (total >= this.ceilingDollars) {
      throw new Error(
        `Paid-tier spend stopped: $${total.toFixed(4)} of the $${this.ceilingDollars.toFixed(2)} ceiling is spent. ` +
          "Raising the ceiling is the user's call (`ai/AGENTS.md`).",
      );
    }
  }

  private dollarsIn(text: string): number {
    const ledger = this.parse(text);
    if (typeof ledger === "object" && ledger !== null && "dollars" in ledger && typeof ledger.dollars === "number") {
      return ledger.dollars;
    }

    throw this.notALedger();
  }

  private parse(text: string): unknown {
    try {
      return JSON.parse(text);
    } catch {
      throw this.notALedger();
    }
  }

  private notALedger(): Error {
    return new Error(
      `The spend ledger at ${this.file} is not a ledger ({"dollars": number}); fix or delete it on purpose.`,
    );
  }
}
