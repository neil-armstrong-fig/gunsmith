import {ARENA_STYLES} from "@gunsmith/shared/arena-style/ArenaStyle";
import {formatOfStyle} from "@gunsmith/ai/pipeline/arena/drafting/format/FormatOfStyle";

it("makes blue arenas from shapes, which can be any size", () => {
  expect(formatOfStyle("blue")).toBe("shapes");
});

it("makes red arenas by editing a built-in arena, which keeps its standard size", () => {
  expect(formatOfStyle("red")).toBe("editBuiltIn");
});

it("gives each style its own format, so choosing one changes what the model is asked", () => {
  expect(new Set(ARENA_STYLES.map(formatOfStyle)).size).toBe(ARENA_STYLES.length);
});
