import {expect, it} from "vitest";
import {browserFailures} from "@gunsmith/audio-studies/browser/run/BrowserFailures";
import type {PageRow} from "@gunsmith/audio-studies/browser/run/types/PageRow";

const CLEAN: PageRow = {name: "a.mp3", failures: []};
const FAILING: PageRow = {name: "b.ogg", failures: ["duration"]};
const UNSUPPORTED: PageRow = {name: "c.ogg", unsupported: true, error: "cannot decode"};

it("is the rows that have a failure, and none when every row is clean", () => {
  expect(browserFailures("webkit", [CLEAN, FAILING])).toStrictEqual([FAILING]);
  expect(browserFailures("webkit", [CLEAN])).toStrictEqual([]);
});

it("counts an export Chromium cannot decode as a failure, because Chromium plays Vorbis", () => {
  expect(browserFailures("chromium", [CLEAN, UNSUPPORTED])).toStrictEqual([UNSUPPORTED]);
});

it("does not count an export another browser cannot decode, which is a finding recorded in its row", () => {
  expect(browserFailures("webkit", [CLEAN, UNSUPPORTED])).toStrictEqual([]);
});
