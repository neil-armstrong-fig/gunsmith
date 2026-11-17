import {appearanceSchema} from "@gunsmith/shared/appearance/schema/Appearance";
import {readArtAppearanceFixtures} from "@gunsmith/ai/pipeline/appearance/testing/ArtAppearanceFixtures";
import {passingAppearance} from "@gunsmith/ai/pipeline/appearance/testing/PassingAppearance";
import {appearanceSvg} from "@evals/eval-criteria-mapping/appearance/drawings/sheet/svg/AppearanceSvg";

it("draws a square svg of the size asked, over the 64-unit design space", () => {
  const svg = appearanceSvg(appearanceSchema.parse(passingAppearance()), 120);

  expect(svg).toContain('viewBox="0 0 64 64" width="120" height="120"');
});

it("draws each part, in order, with its role resolved to a colour", () => {
  const svg = appearanceSvg(appearanceSchema.parse(passingAppearance()), 64);

  expect(svg.indexOf("<rect transform")).toBeLessThan(svg.indexOf("<circle"));
  expect(svg.indexOf("<circle")).toBeLessThan(svg.indexOf("<polygon"));
  expect(svg).toContain('<circle transform="translate(28 32) rotate(0)" r="6" fill="#62B5FF" stroke="#10151B"');
});

it("draws every kind of part: circle, ellipse, rectangle, polygon and polyline", () => {
  const kinds = readArtAppearanceFixtures()
    .flatMap(fixture => appearanceSchema.parse(fixture.appearance).body)
    .map(part => part.kind);
  const svg = readArtAppearanceFixtures()
    .map(fixture => appearanceSvg(appearanceSchema.parse(fixture.appearance), 64))
    .join("");

  expect(new Set(kinds).size).toBe(5);
  for (const tag of ["<circle", "<ellipse", "<rect transform", "<polygon", "<polyline"]) {
    expect(svg).toContain(tag);
  }
});

it("writes the points of a polygon as pairs", () => {
  const svg = appearanceSvg(appearanceSchema.parse(passingAppearance()), 64);

  expect(svg).toContain('points="50,27 60,30 60,34 50,37"');
});

it("never writes an undefined or non-number into the markup, for any of art's appearances", () => {
  const svgs = readArtAppearanceFixtures().map(fixture =>
    appearanceSvg(appearanceSchema.parse(fixture.appearance), 64),
  );

  expect(svgs.length).toBeGreaterThanOrEqual(18);
  expect(svgs.filter(svg => /undefined|NaN|Infinity/.test(svg))).toEqual([]);
});
