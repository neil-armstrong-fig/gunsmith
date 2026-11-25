import {parseArenaStyle} from "@gunsmith/shared/arena-style/ParseArenaStyle";

it("reads each style by its name", () => {
  expect(parseArenaStyle("blue")).toBe("blue");
  expect(parseArenaStyle("red")).toBe("red");
});

it("says nothing when no style was given, so the caller's own default applies", () => {
  expect(parseArenaStyle(undefined)).toBeUndefined();
});

it("refuses anything that is not exactly a style, whatever the client sent", () => {
  expect(parseArenaStyle("Blue")).toBeUndefined();
  expect(parseArenaStyle(" red")).toBeUndefined();
  expect(parseArenaStyle("shapes")).toBeUndefined();
  expect(parseArenaStyle("")).toBeUndefined();
  expect(parseArenaStyle(1)).toBeUndefined();
  expect(parseArenaStyle(null)).toBeUndefined();
  expect(parseArenaStyle({style: "red"})).toBeUndefined();
});
