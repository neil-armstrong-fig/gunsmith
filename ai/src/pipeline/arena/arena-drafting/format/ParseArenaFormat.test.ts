import {DEFAULT_ARENA_FORMAT} from "@gunsmith/ai/pipeline/arena/arena-drafting/format/DefaultArenaFormat";
import {parseArenaFormat} from "@gunsmith/ai/pipeline/arena/arena-drafting/format/ParseArenaFormat";

it("is the default format when nothing is asked for, which is shapes", () => {
  expect(parseArenaFormat(undefined)).toBe(DEFAULT_ARENA_FORMAT);
  expect(DEFAULT_ARENA_FORMAT).toBe("shapes");
});

it("reads each format by name", () => {
  expect(parseArenaFormat("rows")).toBe("rows");
  expect(parseArenaFormat("shapes")).toBe("shapes");
});

it("refuses a name that is no format, naming the ones there are, so a typo cannot quietly run the wrong one", () => {
  expect(() => parseArenaFormat("ascii")).toThrow("rows, shapes");
});
