import assert from "node:assert/strict";
import {it} from "node:test";
import {dbfs} from "@gunsmith/audio-studies/output/wav/measure/Dbfs";

it("is 0 dB at full scale and about -6 dB at half", () => {
  assert.equal(dbfs(1), 0);
  assert.equal(dbfs(0.5), -6.02);
});

it("is -20 dB at a tenth", () => {
  assert.equal(dbfs(0.1), -20);
});

it("rounds to two decimal places", () => {
  assert.equal(dbfs(0.3), -10.46);
});

it("floors silence at -180 dB rather than minus infinity, so it can be written down", () => {
  assert.equal(dbfs(0), -180);
  assert.equal(dbfs(1e-12), -180);
});
