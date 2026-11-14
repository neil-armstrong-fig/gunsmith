import assert from "node:assert/strict";
import {it} from "node:test";
import {servedPath} from "@gunsmith/audio-studies/browser/serve/path/ServedPath";

const ALLOWED = ["/encoded-audio/", "/page/"];

it("maps an allowed address to a file under the root", () => {
  assert.equal(servedPath("/root", "/encoded-audio/report.json", ALLOWED), "/root/encoded-audio/report.json");
  assert.equal(servedPath("/root", "/page/index.html?x=1", ALLOWED), "/root/page/index.html");
});

it("refuses an address outside the allowed folders", () => {
  assert.equal(servedPath("/root", "/package.json", ALLOWED), undefined);
  assert.equal(servedPath("/root", "/encoded-audiobook/x", ALLOWED), undefined);
});

it("refuses an address that climbs out of the root, written plain or encoded", () => {
  assert.equal(servedPath("/root", "/encoded-audio/../package.json", ALLOWED), undefined);
  assert.equal(servedPath("/root", "/encoded-audio/%2e%2e/package.json", ALLOWED), undefined);
  assert.equal(servedPath("/root", "/encoded-audio/..%2fpackage.json", ALLOWED), undefined);
});

it("refuses an address that cannot be decoded", () => {
  assert.equal(servedPath("/root", "/encoded-audio/%E0%A4%A", ALLOWED), undefined);
});
