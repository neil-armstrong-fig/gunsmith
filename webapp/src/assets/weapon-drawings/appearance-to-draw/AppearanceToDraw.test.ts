import {fallbackAppearance} from "@gunsmith/shared/appearance/fallback/FallbackAppearance";
import {appearanceToDraw} from "@src/assets/weapon-drawings/appearance-to-draw/AppearanceToDraw";

it("is the appearance itself when the schema accepts it", () => {
  expect(appearanceToDraw(lantern())).toEqual(lantern());
});

it("is the stand-in for a version the schema does not know", () => {
  expect(appearanceToDraw({...lantern(), version: 2})).toEqual(fallbackAppearance());
});

it("is the stand-in for a stray field, a missing field and a colour that is not a role", () => {
  expect(appearanceToDraw({...lantern(), script: "alert(1)"})).toEqual(fallbackAppearance());

  const {body: _body, ...withoutBody} = lantern();

  expect(appearanceToDraw(withoutBody)).toEqual(fallbackAppearance());
  expect(appearanceToDraw({...lantern(), palette: {accent: "#ff0000", "accent-secondary": "weapon-violet"}})).toEqual(
    fallbackAppearance(),
  );
});

it("is the stand-in for anything that is not an object at all", () => {
  [undefined, null, "a lantern", 42, []].forEach(answer => {
    expect(appearanceToDraw(answer)).toEqual(fallbackAppearance());
  });
});

function lantern(): Record<string, unknown> {
  return {
    version: 1,
    palette: {accent: "weapon-blue", "accent-secondary": "weapon-violet"},
    body: [
      {
        kind: "rect",
        x: 6,
        y: 28,
        width: 18,
        height: 8,
        fill: "body",
        stroke: "edge",
        strokeWidth: 2,
        opacity: 1,
        rotation: 0,
        detail: "structural",
      },
    ],
    projectile: [],
    impact: {preset: "spark", colour: "accent"},
    animation: {preset: "none"},
  };
}
