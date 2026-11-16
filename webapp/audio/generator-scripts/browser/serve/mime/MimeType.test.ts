import {expect, it} from "vitest";
import {mimeType} from "@gunsmith/audio-studies/browser/serve/mime/MimeType";

it("gives each kind of file the type a browser needs to run or decode it", () => {
  expect(mimeType("index.html")).toBe("text/html; charset=utf-8");
  expect(mimeType("DecodePage.js")).toBe("text/javascript; charset=utf-8");
  expect(mimeType("report.json")).toBe("application/json");
  expect(mimeType("sfx-hit.mp3")).toBe("audio/mpeg");
  expect(mimeType("sfx-hit.ogg")).toBe("audio/ogg");
});

it("gives anything else the plain binary type", () => {
  expect(mimeType("notes.txt")).toBe("application/octet-stream");
  expect(mimeType("noextension")).toBe("application/octet-stream");
});
