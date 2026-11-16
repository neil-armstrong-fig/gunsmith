import {expect, it} from "vitest";
import {servedPath} from "@gunsmith/audio-studies/browser/serve/path/ServedPath";

const ALLOWED = ["/encoded-audio/", "/page/"];

it("maps an allowed address to a file under the root", () => {
  expect(servedPath("/root", "/encoded-audio/report.json", ALLOWED)).toBe("/root/encoded-audio/report.json");
  expect(servedPath("/root", "/page/index.html?x=1", ALLOWED)).toBe("/root/page/index.html");
});

it("refuses an address outside the allowed folders", () => {
  expect(servedPath("/root", "/package.json", ALLOWED)).toBe(undefined);
  expect(servedPath("/root", "/encoded-audiobook/x", ALLOWED)).toBe(undefined);
});

it("refuses an address that climbs out of the root, written plain or encoded", () => {
  expect(servedPath("/root", "/encoded-audio/../package.json", ALLOWED)).toBe(undefined);
  expect(servedPath("/root", "/encoded-audio/%2e%2e/package.json", ALLOWED)).toBe(undefined);
  expect(servedPath("/root", "/encoded-audio/..%2fpackage.json", ALLOWED)).toBe(undefined);
});

it("refuses an address that cannot be decoded", () => {
  expect(servedPath("/root", "/encoded-audio/%E0%A4%A", ALLOWED)).toBe(undefined);
});
