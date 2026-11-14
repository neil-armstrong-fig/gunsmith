import {roleColour} from "@evals/eval-criteria-mapping/appearance/drawings/sheet/svg/colour/RoleColour";

const PALETTE = {accent: "weapon-mint", "accent-secondary": "weapon-pink"} as const;

it("is nothing for none, so a part has no fill or no stroke", () => {
  expect(roleColour("none", PALETTE)).toBe("none");
});

it("is the palette's colour for each accent", () => {
  expect(roleColour("accent", PALETTE)).toBe("#8AD4B0");
  expect(roleColour("accent-secondary", PALETTE)).toBe("#F58DBA");
});

it("is one fixed colour for each other role", () => {
  expect(roleColour("body", PALETTE)).toBe("#30404F");
  expect(roleColour("edge", PALETTE)).toBe("#91A2B2");
  expect(roleColour("text", PALETTE)).toBe("#E5EAF0");
  expect(roleColour("outline", PALETTE)).toBe("#10151B");
});
