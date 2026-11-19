import {parseArenaFormat} from "@gunsmith/ai/pipeline/arena/arena-drafting/format/ParseArenaFormat";

it("is rows when nothing is asked for, which is how arenas have always been drawn", () => {
  expect(parseArenaFormat(undefined)).toBe("rows");
});

it("reads each format by name", () => {
  expect(parseArenaFormat("rows")).toBe("rows");
  expect(parseArenaFormat("shapes")).toBe("shapes");
});

it("refuses a name that is no format, naming the ones there are, so a typo cannot quietly run the wrong one", () => {
  expect(() => parseArenaFormat("ascii")).toThrow("rows, shapes");
});
