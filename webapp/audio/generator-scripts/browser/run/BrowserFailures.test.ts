import assert from "node:assert/strict";
import {it} from "node:test";
import {browserFailures} from "@gunsmith/audio-studies/browser/run/BrowserFailures";
import type {PageRow} from "@gunsmith/audio-studies/browser/run/types/PageRow";

const CLEAN: PageRow = {name: "a.mp3", failures: []};
const FAILING: PageRow = {name: "b.ogg", failures: ["duration"]};
const UNSUPPORTED: PageRow = {name: "c.ogg", unsupported: true, error: "cannot decode"};

it("is the rows that have a failure, and none when every row is clean", () => {
  assert.deepEqual(browserFailures("webkit", [CLEAN, FAILING]), [FAILING]);
  assert.deepEqual(browserFailures("webkit", [CLEAN]), []);
});

it("counts an export Chromium cannot decode as a failure, because Chromium plays Vorbis", () => {
  assert.deepEqual(browserFailures("chromium", [CLEAN, UNSUPPORTED]), [UNSUPPORTED]);
});

it("does not count an export another browser cannot decode, which is a finding recorded in its row", () => {
  assert.deepEqual(browserFailures("webkit", [CLEAN, UNSUPPORTED]), []);
});
