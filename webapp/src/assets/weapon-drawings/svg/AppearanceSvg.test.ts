import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {appearanceSchema} from "@gunsmith/shared/appearance/schema/Appearance";
import {fallbackAppearance} from "@gunsmith/shared/appearance/fallback/FallbackAppearance";
import {appearanceSvg} from "@src/assets/weapon-drawings/svg/AppearanceSvg";

const LANTERN = appearanceSchema.parse(
  JSON.parse(
    readFileSync(
      resolve(
        import.meta.dirname,
        "../../../../../docs/art/concepts/top-down-oddities/appearances/jellyfish-cage.json",
      ),
      "utf8",
    ),
  ),
);

it("is a transparent picture over the 64 by 64 design space: no background, no frame", () => {
  const svg = appearanceSvg(fallbackAppearance(), ["structural", "fine"]);

  expect(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">')).toBe(
    true,
  );
  expect(svg.endsWith("</svg>")).toBe(true);
  expect(count(svg, "<rect")).toBe(fallbackAppearance().body.length);
});

it("draws every part of the body when every tier is asked for, back to front", () => {
  const svg = appearanceSvg(LANTERN, ["structural", "fine"]);

  expect(count(svg, "<rect") + count(svg, "<polygon") + count(svg, "<polyline")).toBe(LANTERN.body.length);
  expect(svg.indexOf("<rect")).toBeLessThan(svg.indexOf("<polygon"));
});

it("leaves out the fine parts when only the structural tier is asked for, and no structural part", () => {
  const fine = LANTERN.body.filter(part => part.detail === "fine").length;
  const structural = LANTERN.body.length - fine;
  const svg = appearanceSvg(LANTERN, ["structural"]);

  expect(fine).toBeGreaterThan(0);
  expect(count(svg, "<rect") + count(svg, "<polygon") + count(svg, "<polyline")).toBe(structural);
});

it("writes nothing but colours and numbers into the markup, whatever the drawing's roles", () => {
  const svg = appearanceSvg(LANTERN, ["structural", "fine"]);

  expect(svg).not.toMatch(/weapon-|accent|edge|outline/);
});

function count(text: string, piece: string): number {
  return text.split(piece).length - 1;
}
