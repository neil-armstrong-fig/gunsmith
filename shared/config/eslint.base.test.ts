import {ESLint} from "eslint";
import {expect, it} from "vitest";

it.each(["playwright-report/index.js", "blob-report/probe.js", "all-blob-reports/probe.js"])(
  "ignores generated %s while retaining source lint",
  async filePath => {
    const eslint = new ESLint();
    expect(await eslint.isPathIgnored(filePath)).toBe(true);
    expect(await eslint.isPathIgnored("src/Probe.ts")).toBe(false);
  },
);
